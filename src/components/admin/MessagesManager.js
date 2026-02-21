import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";
import {
  FaTrash,
  FaSpinner,
  FaInbox,
  FaTimes,
  FaCheck,
  FaSearch,
  FaPaperPlane,
  FaUser,
  FaUserShield,
} from "react-icons/fa";
import { format, formatDistanceToNow } from "date-fns";

const STATUS_COLORS = {
  new: "bg-saffron/15 text-saffron",
  read: "bg-blue-500/15 text-blue-400",
  replied: "bg-green-500/15 text-green-400",
  user_replied: "bg-purple-500/15 text-purple-400",
};

const STATUS_LABELS = {
  new: "New",
  read: "Read",
  replied: "Replied",
  user_replied: "User Replied",
};

const MessagesManager = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [conversation, setConversation] = useState([]);
  const [loadingConvo, setLoadingConvo] = useState(false);
  const chatEndRef = useRef(null);

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
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "contact_messages" },
        (payload) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === payload.new.id
                ? { ...payload.new, ...m, status: payload.new.status }
                : m,
            ),
          );
          // If the updated message is selected, refresh its data
          if (
            selectedMsg?.id === payload.new.id &&
            payload.new.status === "user_replied"
          ) {
            toast("New reply from " + (payload.new.name || "user") + "!", {
              icon: "💬",
            });
            fetchConversation(payload.new.id);
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "replies" },
        (payload) => {
          // If this reply belongs to the selected conversation
          if (selectedMsg && payload.new.message_id === selectedMsg.id) {
            setConversation((prev) => {
              const exists = prev.some((r) => r.id === payload.new.id);
              if (exists) return prev;
              return [...prev, payload.new];
            });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMsg?.id]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation]);

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

  const fetchConversation = async (messageId) => {
    setLoadingConvo(true);
    try {
      const { data, error } = await supabase
        .from("replies")
        .select("*")
        .eq("message_id", messageId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      setConversation(data || []);
    } catch (err) {
      console.error("Failed to load conversation:", err);
      setConversation([]);
    } finally {
      setLoadingConvo(false);
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
        prev.map((m) => (m.id === msg.id ? { ...m, status: "read" } : m)),
      );
    } catch (err) {
      /* silent */
    }
  };

  const handleSelectMessage = (msg) => {
    setSelectedMsg(msg);
    markAsRead(msg);
    fetchConversation(msg.id);
    setReplyText("");
  };

  const handleReply = async () => {
    if (!replyText.trim() || !selectedMsg) return;

    setReplying(true);
    try {
      const res = await fetch("/api/send-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId: selectedMsg.id,
          replyText: replyText.trim(),
        }),
      });

      const result = await res.json();

      if (!res.ok && res.status !== 207) {
        throw new Error(result.error || "Reply failed");
      }

      /* ── Add reply to local conversation ── */
      const newReply = {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        message_id: selectedMsg.id,
        sender_type: "admin",
        reply_text: replyText.trim(),
        created_at: new Date().toISOString(),
      };
      setConversation((prev) => [...prev, newReply]);

      /* ── Update message status ── */
      const now = new Date().toISOString();
      setMessages((prev) =>
        prev.map((m) =>
          m.id === selectedMsg.id
            ? { ...m, status: "replied", replied_at: now }
            : m,
        ),
      );
      setSelectedMsg((prev) => ({
        ...prev,
        status: "replied",
        replied_at: now,
      }));
      setReplyText("");

      if (result.warning) {
        toast.success("Reply saved, but email delivery failed. Check logs.");
      } else {
        toast.success("Reply sent to " + selectedMsg.email + " ✉️");
      }
    } catch (err) {
      toast.error("Reply failed: " + err.message);
    } finally {
      setReplying(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleReply();
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
        <h1 className="text-2xl font-heading font-bold text-gray-800">
          Messages
        </h1>
        <p className="text-gray-400 text-sm font-body mt-1">
          {
            messages.filter(
              (m) => m.status === "new" || m.status === "user_replied",
            ).length
          }{" "}
          need
          {messages.filter(
            (m) => m.status === "new" || m.status === "user_replied",
          ).length !== 1
            ? " attention"
            : "s attention"}
        </p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
        <div className="flex gap-1.5 flex-wrap">
          {["all", "new", "user_replied", "read", "replied"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-heading font-semibold transition-colors capitalize ${
                filter === f
                  ? "bg-saffron/15 text-saffron"
                  : "text-gray-300 hover:text-gray-500 hover:bg-gray-50"
              }`}
            >
              {f === "user_replied" ? "User Replied" : f}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-800 text-xs font-body
              placeholder-gray-400 focus:border-saffron outline-none transition-all"
            placeholder="Search messages..."
          />
        </div>
      </div>

      <div className="flex gap-5">
        {/* Messages List */}
        <div className="flex-1 space-y-2 min-w-0">
          {filteredMessages.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-12 text-center">
              <FaInbox className="text-gray-200 text-4xl mx-auto mb-3" />
              <p className="text-gray-300 text-sm font-body">
                {search || filter !== "all"
                  ? "No messages match your filter"
                  : "No messages yet"}
              </p>
            </div>
          ) : (
            filteredMessages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => handleSelectMessage(msg)}
                className={`bg-gray-50 border rounded-xl p-4 cursor-pointer transition-all hover:border-gray-200 ${
                  selectedMsg?.id === msg.id
                    ? "border-saffron/30 bg-saffron/5"
                    : "border-gray-100"
                } ${msg.status === "new" ? "border-l-2 border-l-saffron" : ""} ${
                  msg.status === "user_replied"
                    ? "border-l-2 border-l-purple-400"
                    : ""
                }`}
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
                          msg.status === "new" || msg.status === "user_replied"
                            ? "text-gray-800 font-bold"
                            : "text-gray-600 font-semibold"
                        }`}
                      >
                        {msg.name}
                      </p>
                      <span
                        className={`px-1.5 py-0.5 text-[8px] font-heading font-bold rounded-full uppercase whitespace-nowrap ${
                          STATUS_COLORS[msg.status]
                        }`}
                      >
                        {STATUS_LABELS[msg.status] || msg.status}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs font-body truncate">
                      {msg.subject || msg.message?.slice(0, 60)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-gray-300 text-[10px] font-body">
                        {formatDistanceToNow(new Date(msg.created_at), {
                          addSuffix: true,
                        })}
                      </p>
                      {msg.ticket_id && (
                        <span className="text-gray-300 text-[9px] font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                          {msg.ticket_id}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSoftDelete(msg.id);
                    }}
                    className="p-1.5 text-gray-200 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Conversation Panel */}
        {selectedMsg && (
          <div
            className="hidden lg:flex lg:flex-col w-[440px] bg-white border border-gray-200 rounded-2xl shadow-sm sticky top-20 self-start overflow-hidden"
            style={{ maxHeight: "calc(100vh - 120px)" }}
          >
            {/* ── Header ── */}
            <div className="p-5 border-b border-gray-100 flex-shrink-0">
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
                    <p className="text-gray-800 font-heading font-semibold text-sm">
                      {selectedMsg.name}
                    </p>
                    <p className="text-gray-400 text-xs font-body">
                      {selectedMsg.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedMsg.ticket_id && (
                    <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                      {selectedMsg.ticket_id}
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setSelectedMsg(null);
                      setConversation([]);
                    }}
                    className="text-gray-300 hover:text-gray-800 p-1"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
            </div>

            {/* ── Chat Thread ── */}
            <div
              className="flex-1 overflow-y-auto p-5 space-y-4"
              style={{ minHeight: "200px", maxHeight: "400px" }}
            >
              {/* Original message (always first) */}
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FaUser className="text-blue-400 text-[10px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-heading font-semibold text-gray-700">
                      {selectedMsg.name}
                    </span>
                    <span className="text-[10px] text-gray-300 font-body">
                      {format(
                        new Date(selectedMsg.created_at),
                        "MMM d, h:mm a",
                      )}
                    </span>
                  </div>
                  {selectedMsg.subject && (
                    <p className="text-[11px] font-heading font-semibold text-gray-500 mb-1">
                      Re: {selectedMsg.subject}
                    </p>
                  )}
                  <div className="bg-gray-50 rounded-xl rounded-tl-sm p-3.5">
                    <p className="text-gray-600 text-sm font-body leading-relaxed whitespace-pre-wrap">
                      {selectedMsg.message}
                    </p>
                  </div>
                </div>
              </div>

              {/* Loading indicator */}
              {loadingConvo && (
                <div className="flex justify-center py-3">
                  <div className="w-5 h-5 border-2 border-saffron border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {/* Conversation replies */}
              {conversation.map((reply) => (
                <div
                  key={reply.id}
                  className={`flex gap-3 ${reply.sender_type === "admin" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      reply.sender_type === "admin"
                        ? "bg-saffron/15"
                        : "bg-blue-100"
                    }`}
                  >
                    {reply.sender_type === "admin" ? (
                      <FaUserShield className="text-saffron text-[10px]" />
                    ) : (
                      <FaUser className="text-blue-400 text-[10px]" />
                    )}
                  </div>
                  <div
                    className={`flex-1 min-w-0 ${reply.sender_type === "admin" ? "text-right" : ""}`}
                  >
                    <div
                      className={`flex items-center gap-2 mb-1 ${reply.sender_type === "admin" ? "justify-end" : ""}`}
                    >
                      <span className="text-xs font-heading font-semibold text-gray-700">
                        {reply.sender_type === "admin"
                          ? "You"
                          : selectedMsg.name}
                      </span>
                      <span className="text-[10px] text-gray-300 font-body">
                        {format(new Date(reply.created_at), "MMM d, h:mm a")}
                      </span>
                    </div>
                    <div
                      className={`inline-block max-w-full rounded-xl p-3.5 ${
                        reply.sender_type === "admin"
                          ? "bg-gradient-to-br from-saffron/10 to-gold/10 rounded-tr-sm text-left"
                          : "bg-gray-50 rounded-tl-sm"
                      }`}
                    >
                      <p className="text-gray-600 text-sm font-body leading-relaxed whitespace-pre-wrap">
                        {reply.reply_text}
                      </p>
                    </div>
                    {reply.sender_type === "admin" && (
                      <div
                        className={`flex items-center gap-1 mt-1 ${reply.sender_type === "admin" ? "justify-end" : ""}`}
                      >
                        <FaCheck className="text-green-400 text-[8px]" />
                        <span className="text-[9px] text-green-400 font-body">
                          Sent via email
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <div ref={chatEndRef} />
            </div>

            {/* ── Reply Composer (always visible) ── */}
            <div className="p-4 border-t border-gray-100 flex-shrink-0 bg-gray-50/50">
              <div className="flex gap-2">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={2}
                  className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-800 text-sm font-body
                    placeholder-gray-400 focus:border-saffron outline-none transition-all resize-none"
                  placeholder="Type your reply... (Ctrl+Enter to send)"
                />
                <button
                  onClick={handleReply}
                  disabled={replying || !replyText.trim()}
                  className="self-end px-4 py-2.5 bg-gradient-to-r from-saffron to-gold text-white text-sm
                    font-heading font-bold rounded-xl hover:shadow-lg hover:shadow-saffron/25 transition-all
                    disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {replying ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaPaperPlane className="text-xs" />
                  )}
                </button>
              </div>
              <p className="text-[10px] text-gray-300 font-body mt-1.5 text-center">
                Replies are sent to {selectedMsg.email} via email
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesManager;
