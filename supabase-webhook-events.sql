-- ═══════════════════════════════════════════════════════════════════
-- WEBHOOK EVENTS TABLE — Idempotency / Dedup for Resend webhooks
-- Run this in Supabase SQL Editor (one-time migration)
-- ═══════════════════════════════════════════════════════════════════

-- This table stores processed webhook event IDs (svix-id header)
-- so that duplicate deliveries from Resend are safely ignored.

CREATE TABLE IF NOT EXISTS public.webhook_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  svix_id     TEXT UNIQUE NOT NULL,               -- Svix delivery ID (idempotency key)
  event_type  TEXT NOT NULL DEFAULT 'unknown',     -- e.g. "email.received"
  payload     JSONB,                               -- Raw webhook data (for debugging)
  processed_at TIMESTAMPTZ DEFAULT now()
);

-- Fast lookup by svix_id (used on every webhook call)
CREATE INDEX IF NOT EXISTS idx_webhook_events_svix_id
  ON public.webhook_events (svix_id);

-- Auto-cleanup: keep only last 30 days of webhook events
-- (optional — run via Supabase pg_cron or manually)
-- DELETE FROM webhook_events WHERE processed_at < now() - INTERVAL '30 days';

-- ─── RLS ───────────────────────────────────────────────
-- The inbound-email handler uses service_role key (bypasses RLS),
-- but we enable RLS for safety and allow authenticated reads for admin debugging.

ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users can read webhook_events"
  ON public.webhook_events FOR SELECT
  TO authenticated
  USING (true);

-- Service role inserts bypass RLS automatically.
-- Block anon access entirely.
CREATE POLICY "Anon cannot access webhook_events"
  ON public.webhook_events FOR ALL
  TO anon
  USING (false);

-- ═══════════════════════════════════════════════════════════════════
-- DONE! The inbound-email.js webhook handler will now use this table
-- for dedup. If the table doesn't exist, the handler gracefully
-- falls back to content-based dedup.
-- ═══════════════════════════════════════════════════════════════════
