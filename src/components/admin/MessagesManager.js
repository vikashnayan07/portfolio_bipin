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
  FaArrowLeft,
  FaReply,
} from "react-icons/fa";
import { format, formatDistanceToNow } from "date-fns";

const STATUS_COLORS = {
  new: "bg-amber-100 text-amber-700",
  read: "bg-blue-100 text-blue-600",
  replied: "bg-emerald-100 text-emerald-700",
  user_replied: "bg-violet-100 text-violet-700",
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
  const [mobileView, setMobileView] = useState("list"); // 'list' | 'chat'
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();

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
    setMobileView("chat");
  };

  const handleBackToList = () => {
    setMobileView("list");
    setSelectedMsg(null);
    setConversation([]);
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

      const newReply = {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        message_id: selectedMsg.id,
        sender_type: "admin",
        reply_text: replyText.trim(),
        created_at: new Date().toISOString(),
      };
      setConversation((prev) => [...prev, newReply]);

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
        toast.success("Reply saved, but email delivery failed.");
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
      if (selectedMsg?.id === id) {
        setSelectedMsg(null);
        setMobileView("list");
      }
      toast.success("Message moved to trash");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

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

  const needAttention = messages.filter(
    (m) => m.status === "new" || m.status === "user_replied",
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  /* ═══════════ CONVERSATION PANEL (shared for desktop + mobile) ═══════════ */
  const ConversationPanel = ({ isFullScreen = false }) => {
    if (!selectedMsg) return null;

    return (
      <div
        className={`flex flex-col bg-white ${
          isFullScreen
            ? "fixed inset-0 z-50 lg:relative lg:z-auto lg:rounded-2xl lg:border lg:border-gray-200 lg:shadow-lg"
            : "rounded-2xl border border-gray-200 shadow-lg"
        }`}
        style={!isFullScreen ? { maxHeight: "calc(100vh - 140px)" } : {}}
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex-shrink-0 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isFullScreen && (
                <button
                  onClick={handleBackToList}
                  className="lg:hidden p-2 -ml-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FaArrowLeft />
                </button>
              )}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
                {selectedMsg.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div>
                <p className="text-gray-900 font-semibold text-sm">
                  {selectedMsg.name}
                </p>
                <p className="text-gray-400 text-xs">
                  {selectedMsg.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selectedMsg.ticket_id && (
                <span className="hidden sm:inline-block text-[10px] font-mono text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                  {selectedMsg.ticket_id}
                </span>
              )}
              <button
                onClick={() => {
                  setSelectedMsg(null);
                  setConversation([]);
                  setMobileView("list");
                }}
                className="p-2 text-gray-300 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaTimes size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Chat Thread */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-5 bg-gradient-to-b from-slate-50/50 to-white">
          {/* Original Message */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <FaUser className="text-blue-500 text-xs" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-semibold text-gray-800">
                  {selectedMsg.name}
                </span>
                <span className="text-[10px] text-gray-400">
                  {format(new Date(selectedMsg.created_at), "MMM d, h:mm a")}
                </span>
              </div>
              {selectedMsg.subject && (
                <p className="text-[11px] font-semibold text-gray-500 mb-1.5">
                  Subject: {selectedMsg.subject}
                </p>
              )}
              <div className="bg-white rounded-2xl rounded-tl-md p-4 shadow-sm border border-gray-100">
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedMsg.message}
                </p>
              </div>
            </div>
          </div>

          {/* Loading */}
          {loadingConvo && (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Replies */}
          {conversation.map((reply) => (
            <div
              key={reply.id}
              className={`flex gap-3 ${reply.sender_type === "admin" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm ${
                  reply.sender_type === "admin"
                    ? "bg-gradient-to-br from-amber-400 to-orange-500"
                    : "bg-blue-100"
                }`}
              >
                {reply.sender_type === "admin" ? (
                  <FaUserShield className="text-white text-xs" />
                ) : (
                  <FaUser className="text-blue-500 text-xs" />
                )}
              </div>
              <div
                className={`flex-1 min-w-0 ${reply.sender_type === "admin" ? "text-right" : ""}`}
              >
                <div
                  className={`flex items-center gap-2 mb-1.5 ${reply.sender_type === "admin" ? "justify-end" : ""}`}
                >
                  <span className="text-xs font-semibold text-gray-800">
                    {reply.sender_type === "admin" ? "You" : selectedMsg.name}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {format(new Date(reply.created_at), "MMM d, h:mm a")}
                  </span>
                </div>
                <div
                  className={`inline-block max-w-[85%] rounded-2xl p-4 shadow-sm ${
                    reply.sender_type === "admin"
                      ? "bg-gradient-to-br from-amber-50 to-orange-50 rounded-tr-md text-left border border-amber-100"
                      : "bg-white rounded-tl-md border border-gray-100"
                  }`}
                >
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                    {reply.reply_text}
                  </p>
                </div>
                {reply.sender_type === "admin" && (
                  <div className="flex items-center gap-1 mt-1 justify-end">
                    <FaCheck className="text-emerald-500 text-[9px]" />
                    <span className="text-[9px] text-emerald-500">
                      Sent via email
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}

          <div ref={chatEndRef} />
        </div>

        {/* Reply Composer */}
        <div className="px-4 sm:px-6 py-4 border-t border-gray-100 flex-shrink-0 bg-white">
          <div className="flex gap-3 items-end">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-800 text-sm
                placeholder-gray-400 focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100 outline-none transition-all resize-none"
              placeholder="Type your reply... (Ctrl+Enter to send)"
            />
            <button
              onClick={handleReply}
              disabled={replying || !replyText.trim()}
              className="px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm
                font-bold rounded-2xl hover:shadow-lg hover:shadow-amber-200 transition-all
                disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 active:scale-95"
            >
              {replying ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaPaperPlane className="text-xs" />
              )}
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 text-center">
            Replies are sent to {selectedMsg.email} via email
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Messages
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {needAttention > 0 ? (
            <span>
              <span className="text-amber-600 font-semibold">{needAttention}</span> need attention
            </span>
          ) : (
            "All caught up!"
          )}
        </p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="flex gap-1.5 flex-wrap">
          {["all", "new", "user_replied", "read", "replied"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filter === f
                  ? "bg-amber-500 text-white shadow-md shadow-amber-200"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {f === "user_replied" ? "User Replied" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs w-full">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm
              placeholder-gray-400 focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100 outline-none transition-all"
            placeholder="Search messages..."
          />
        </div>
      </div>

      {/* MOBILE: full-screen conversation */}
      {mobileView === "chat" && selectedMsg && (
        <div className="lg:hidden">
          <ConversationPanel isFullScreen={true} />
        </div>
      )}

      {/* Main layout */}
      <div className={`flex gap-6 ${mobileView === "chat" ? "hidden lg:flex" : ""}`}>
        {/* Messages List */}
        <div className="flex-1 space-y-2 min-w-0">
          {filteredMessages.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <FaInbox className="text-gray-300 text-2xl" />
              </div>
              <p className="text-gray-400 text-sm font-medium">
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
                className={`group bg-white border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md hover:border-gray-300 ${
                  selectedMsg?.id === msg.id
                    ? "border-amber-300 bg-amber-50/50 shadow-md ring-1 ring-amber-200"
                    : "border-gray-200"
                } ${msg.status === "new" ? "border-l-4 border-l-amber-400" : ""} ${
                  msg.status === "user_replied"
                    ? "border-l-4 border-l-violet-400"
                    : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-sm ${
                      msg.status === "new"
                        ? "bg-gradient-to-br from-amber-400 to-orange-400 text-white"
                        : msg.status === "user_replied"
                          ? "bg-gradient-to-br from-violet-400 to-purple-500 text-white"
                          : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {msg.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p
                        className={`text-sm truncate ${
                          msg.status === "new" || msg.status === "user_replied"
                            ? "text-gray-900 font-bold"
                            : "text-gray-700 font-semibold"
                        }`}
                      >
                        {msg.name}
                      </p>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wide ${
                          STATUS_COLORS[msg.status]
                        }`}
                      >
                        {STATUS_LABELS[msg.status] || msg.status}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs truncate mt-0.5">
                      {msg.subject || msg.message?.slice(0, 60)}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <p className="text-gray-400 text-[11px]">
                        {formatDistanceToNow(new Date(msg.created_at), {
                          addSuffix: true,
                        })}
                      </p>
                      {msg.ticket_id && (
                        <span className="text-gray-400 text-[10px] font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                          {msg.ticket_id}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Quick reply indicator on mobile */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectMessage(msg);
                      }}
                      className="lg:hidden p-2 text-gray-300 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                    >
                      <FaReply className="text-xs" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSoftDelete(msg.id);
                      }}
                      className="p-2 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Conversation Panel */}
        {selectedMsg && (
          <div className="hidden lg:block w-[480px] sticky top-20 self-start">
            <ConversationPanel />
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesManager;
