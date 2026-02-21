-- ═══════════════════════════════════════════════════════════════════
-- SUPABASE CONVERSATIONS UPGRADE — Run in SQL Editor
-- Adds: replies table, conversation threading, inbound webhook support
-- ═══════════════════════════════════════════════════════════════════

-- ─── 1. Create replies table ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.replies (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id  UUID NOT NULL REFERENCES public.contact_messages(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('admin', 'user')),
  reply_text  TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_replies_message_id ON public.replies(message_id);
CREATE INDEX IF NOT EXISTS idx_replies_created_at ON public.replies(created_at);

-- ─── 2. Add ticket_id column to contact_messages ───────────────
-- Short human-readable ticket ID for email subject threading
ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS ticket_id TEXT;

-- Generate ticket IDs for existing messages
UPDATE public.contact_messages
  SET ticket_id = 'TKT-' || UPPER(LEFT(id::text, 8))
  WHERE ticket_id IS NULL;

-- Auto-generate ticket_id on new messages
CREATE OR REPLACE FUNCTION generate_ticket_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ticket_id := 'TKT-' || UPPER(LEFT(NEW.id::text, 8));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_generate_ticket_id ON public.contact_messages;
CREATE TRIGGER trg_generate_ticket_id
  BEFORE INSERT ON public.contact_messages
  FOR EACH ROW
  WHEN (NEW.ticket_id IS NULL)
  EXECUTE FUNCTION generate_ticket_id();

-- ─── 3. Update status check to support 'user_replied' ─────────
-- Drop old constraint if exists and add new one
DO $$
BEGIN
  -- Try to drop old constraint (may not exist with explicit name)
  BEGIN
    ALTER TABLE public.contact_messages
      DROP CONSTRAINT IF EXISTS contact_messages_status_check;
  EXCEPTION WHEN undefined_object THEN NULL;
  END;
  
  -- Add new constraint supporting 'user_replied'
  BEGIN
    ALTER TABLE public.contact_messages
      ADD CONSTRAINT contact_messages_status_check
      CHECK (status IN ('new', 'read', 'replied', 'user_replied'));
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

-- ─── 4. RLS Policies for replies table ─────────────────────────
ALTER TABLE public.replies ENABLE ROW LEVEL SECURITY;

-- Authenticated users (admin) can read all replies
CREATE POLICY "Auth users can read replies"
  ON public.replies FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users (admin) can insert replies
CREATE POLICY "Auth users can insert replies"
  ON public.replies FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Service role (webhook) can insert replies — bypasses RLS automatically
-- Anon users should NOT read replies
CREATE POLICY "Anon cannot read replies"
  ON public.replies FOR SELECT
  TO anon
  USING (false);

-- ─── 5. Enable realtime for replies table ──────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE public.replies;

-- ─── 6. RPC: Get conversation thread for a message ─────────────
CREATE OR REPLACE FUNCTION get_conversation(p_message_id UUID)
RETURNS TABLE (
  id UUID,
  sender_type TEXT,
  reply_text TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT r.id, r.sender_type, r.reply_text, r.created_at
  FROM public.replies r
  WHERE r.message_id = p_message_id
  ORDER BY r.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════════
-- DONE! Now deploy your updated code and set RESEND_WEBHOOK_SECRET
-- in your Vercel environment variables.
-- ═══════════════════════════════════════════════════════════════════
