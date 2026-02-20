import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Link } from "react-router-dom";
import {
  FaProjectDiagram,
  FaPenNib,
  FaEnvelope,
  FaEye,
  FaArrowRight,
  FaClock,
} from "react-icons/fa";
import { format } from "date-fns";

const StatCard = ({ icon: Icon, label, value, color, to }) => (
  <Link
    to={to}
    className="group bg-white/5 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all duration-300"
  >
    <div className="flex items-center justify-between mb-3">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}
      >
        <Icon className="text-lg" />
      </div>
      <FaArrowRight className="text-white/20 group-hover:text-white/40 text-xs transition-colors" />
    </div>
    <p className="text-2xl font-heading font-bold text-white">{value}</p>
    <p className="text-white/40 text-xs font-body mt-1">{label}</p>
  </Link>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    projects: 0,
    blogs: 0,
    messages: 0,
    newMessages: 0,
    visitors: 0,
  });
  const [recentMessages, setRecentMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [projectsRes, blogsRes, messagesRes, newMsgRes, visitorsRes, recentRes] =
          await Promise.all([
            supabase
              .from("projects")
              .select("*", { count: "exact", head: true })
              .eq("is_deleted", false),
            supabase
              .from("blog_posts")
              .select("*", { count: "exact", head: true })
              .eq("is_deleted", false),
            supabase
              .from("contact_messages")
              .select("*", { count: "exact", head: true })
              .eq("is_deleted", false),
            supabase
              .from("contact_messages")
              .select("*", { count: "exact", head: true })
              .eq("status", "new")
              .eq("is_deleted", false),
            supabase
              .from("visitors")
              .select("*", { count: "exact", head: true }),
            supabase
              .from("contact_messages")
              .select("*")
              .eq("is_deleted", false)
              .order("created_at", { ascending: false })
              .limit(5),
          ]);

        setStats({
          projects: projectsRes.count || 0,
          blogs: blogsRes.count || 0,
          messages: messagesRes.count || 0,
          newMessages: newMsgRes.count || 0,
          visitors: visitorsRes.count || 0,
        });
        setRecentMessages(recentRes.data || []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-saffron border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-white">Dashboard</h1>
        <p className="text-white/40 text-sm font-body mt-1">
          Overview of your portfolio
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FaProjectDiagram}
          label="Total Projects"
          value={stats.projects}
          color="bg-blue-500/15 text-blue-400"
          to="/admin/projects"
        />
        <StatCard
          icon={FaPenNib}
          label="Blog Posts"
          value={stats.blogs}
          color="bg-purple-500/15 text-purple-400"
          to="/admin/blog"
        />
        <StatCard
          icon={FaEnvelope}
          label="Messages"
          value={`${stats.newMessages} new`}
          color="bg-saffron/15 text-saffron"
          to="/admin/messages"
        />
        <StatCard
          icon={FaEye}
          label="Total Visitors"
          value={stats.visitors}
          color="bg-green-500/15 text-green-400"
          to="/admin"
        />
      </div>

      {/* Recent Messages */}
      <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-heading font-bold text-white">
            Recent Messages
          </h2>
          <Link
            to="/admin/messages"
            className="text-saffron text-xs font-body hover:underline flex items-center gap-1"
          >
            View all <FaArrowRight className="text-[10px]" />
          </Link>
        </div>

        {recentMessages.length === 0 ? (
          <p className="text-white/30 text-sm font-body py-8 text-center">
            No messages yet
          </p>
        ) : (
          <div className="space-y-3">
            {recentMessages.map((msg) => (
              <div
                key={msg.id}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    msg.status === "new"
                      ? "bg-saffron/20 text-saffron"
                      : msg.status === "replied"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-white/10 text-white/40"
                  }`}
                >
                  {msg.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white text-sm font-heading font-semibold truncate">
                      {msg.name}
                    </p>
                    {msg.status === "new" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-saffron flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-white/50 text-xs font-body truncate">
                    {msg.subject || msg.message}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-white/30 text-[10px] font-body flex-shrink-0">
                  <FaClock className="text-[8px]" />
                  {format(new Date(msg.created_at), "MMM d")}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
