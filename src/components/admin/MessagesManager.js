import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";
import {
  FaEnvelope,
  FaTrash,
  FaReply,
  FaSpinner,
  FaInbox,
  FaTimes,
  FaCheck,
  FaSearch,
} from "react-icons/fa";
import { format, formatDistanceToNow } from "date-fns";

const STATUS_COLORS = {
  new: "bg-saffron/15 text-saffron",
  read: "bg-blue-500/15 text-blue-400",
  replied: "bg-green-500/15 text-green-400",
};

const MessagesManager = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchMessages();

    // Realtime subscription for new messages
    const channel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "contact_messages" },
        (payload) => {
          setMessages((prev) => [payload.new, ...prev]);
          toast("New message from " + payload.new.name, { icon: "📩" });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (msg) => {
    if (msg.status !== "new") return;
    try {
      await supabase
        .from("contact_messages")
        .update({ status: "read" })
        .eq("id", msg.id);
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, status: "read" } : m))
      );
    } catch (err) {
      /* silent */
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !selectedMsg) return;

    setReplying(true);
    try {
      const { error } = await supabase
        .from("contact_messages")
        .update({
          reply: replyText,
          status: "replied",
          replied_at: new Date().toISOString(),
        })
        .eq("id", selectedMsg.id);

      if (error) throw error;

      setMessages((prev) =>
        prev.map((m) =>
          m.id === selectedMsg.id
            ? {
                ...m,
                reply: replyText,
                status: "replied",
                replied_at: new Date().toISOString(),
              }
            : m
        )
      );
      setSelectedMsg((prev) => ({
        ...prev,
        reply: replyText,
        status: "replied",
      }));
      setReplyText("");
      toast.success("Reply saved!");
    } catch (err) {
      toast.error("Reply failed");
    } finally {
      setReplying(false);
    }
  };

  const handleSoftDelete = async (id) => {
    if (!window.confirm("Move this message to trash?")) return;
    try {
      const { error } = await supabase
        .from("contact_messages")
        .update({ is_deleted: true })
        .eq("id", id);
      if (error) throw error;
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selectedMsg?.id === id) setSelectedMsg(null);
      toast.success("Message moved to trash");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  // Filter & search
  const filteredMessages = messages.filter((m) => {
    if (filter !== "all" && m.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        m.name?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q) ||
        m.subject?.toLowerCase().includes(q) ||
        m.message?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-saffron border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-white">Messages</h1>
        <p className="text-white/40 text-sm font-body mt-1">
          {messages.filter((m) => m.status === "new").length} new message
          {messages.filter((m) => m.status === "new").length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
        <div className="flex gap-1.5">
          {["all", "new", "read", "replied"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-heading font-semibold transition-colors capitalize ${
                filter === f
                  ? "bg-saffron/15 text-saffron"
                  : "text-white/30 hover:text-white/50 hover:bg-white/5"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 text-xs" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-body
              placeholder-white/30 focus:border-saffron outline-none transition-all"
            placeholder="Search messages..."
          />
        </div>
      </div>

      <div className="flex gap-5">
        {/* Messages List */}
        <div className="flex-1 space-y-2">
          {filteredMessages.length === 0 ? (
            <div className="bg-white/5 border border-white/5 rounded-2xl p-12 text-center">
              <FaInbox className="text-white/10 text-4xl mx-auto mb-3" />
              <p className="text-white/30 text-sm font-body">
                {search || filter !== "all"
                  ? "No messages match your filter"
                  : "No messages yet"}
              </p>
            </div>
          ) : (
            filteredMessages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => {
                  setSelectedMsg(msg);
                  markAsRead(msg);
                }}
                className={`bg-white/5 border rounded-xl p-4 cursor-pointer transition-all hover:border-white/15 ${
                  selectedMsg?.id === msg.id
                    ? "border-saffron/30 bg-saffron/5"
                    : "border-white/5"
                } ${msg.status === "new" ? "border-l-2 border-l-saffron" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      STATUS_COLORS[msg.status]
                    }`}
                  >
                    {msg.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-sm font-heading truncate ${
                          msg.status === "new"
                            ? "text-white font-bold"
                            : "text-white/70 font-semibold"
                        }`}
                      >
                        {msg.name}
                      </p>
                      <span
                        className={`px-1.5 py-0.5 text-[8px] font-heading font-bold rounded-full uppercase ${
                          STATUS_COLORS[msg.status]
                        }`}
                      >
                        {msg.status}
                      </span>
                    </div>
                    <p className="text-white/50 text-xs font-body truncate">
                      {msg.subject || msg.message?.slice(0, 60)}
                    </p>
                    <p className="text-white/25 text-[10px] font-body mt-1">
                      {formatDistanceToNow(new Date(msg.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSoftDelete(msg.id);
                    }}
                    className="p-1.5 text-white/15 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message Detail */}
        {selectedMsg && (
          <div className="hidden lg:block w-[400px] bg-white/5 border border-white/5 rounded-2xl p-5 sticky top-20 self-start space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    STATUS_COLORS[selectedMsg.status]
                  }`}
                >
                  {selectedMsg.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-heading font-semibold text-sm">
                    {selectedMsg.name}
                  </p>
                  <p className="text-white/40 text-xs font-body">
                    {selectedMsg.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMsg(null)}
                className="text-white/20 hover:text-white p-1"
              >
                <FaTimes />
              </button>
            </div>

            {selectedMsg.subject && (
              <div>
                <p className="text-white/40 text-[10px] font-heading uppercase tracking-wider mb-1">
                  Subject
                </p>
                <p className="text-white/80 text-sm font-body">
                  {selectedMsg.subject}
                </p>
              </div>
            )}

            <div>
              <p className="text-white/40 text-[10px] font-heading uppercase tracking-wider mb-1">
                Message
              </p>
              <p className="text-white/70 text-sm font-body leading-relaxed whitespace-pre-wrap">
                {selectedMsg.message}
              </p>
            </div>

            <p className="text-white/25 text-[10px] font-body">
              Received{" "}
              {format(new Date(selectedMsg.created_at), "MMM d, yyyy 'at' h:mm a")}
            </p>

            {/* Reply section */}
            {selectedMsg.reply ? (
              <div className="bg-green-500/5 border border-green-500/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FaCheck className="text-green-400 text-xs" />
                  <p className="text-green-400 text-xs font-heading font-semibold">
                    Replied
                  </p>
                </div>
                <p className="text-white/60 text-sm font-body">
                  {selectedMsg.reply}
                </p>
                {selectedMsg.replied_at && (
                  <p className="text-white/20 text-[10px] font-body mt-2">
                    {format(
                      new Date(selectedMsg.replied_at),
                      "MMM d, yyyy 'at' h:mm a"
                    )}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-body
                    placeholder-white/30 focus:border-saffron outline-none transition-all resize-none"
                  placeholder="Write your reply..."
                />
                <button
                  onClick={handleReply}
                  disabled={replying || !replyText.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-saffron to-gold text-white text-sm
                    font-heading font-bold rounded-xl hover:shadow-lg hover:shadow-saffron/25 transition-all
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {replying ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaReply />
                  )}
                  {replying ? "Sending..." : "Reply"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesManager;
