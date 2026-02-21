import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { Link } from "react-router-dom";
import {
  FaProjectDiagram,
  FaPenNib,
  FaEnvelope,
  FaArrowRight,
  FaClock,
  FaDesktop,
  FaMobileAlt,
  FaTabletAlt,
  FaChartLine,
  FaFire,
  FaUsers,
  FaGlobeAsia,
} from "react-icons/fa";
import { format, subDays, isToday, isYesterday } from "date-fns";

/* ═══════════════════════════════════════════════
   STAT CARD — top-level metric
═══════════════════════════════════════════════ */
const StatCard = ({ icon: Icon, label, value, color, to, subtitle }) => (
  <Link
    to={to}
    className="group bg-white border border-gray-200 shadow-sm rounded-2xl p-5 hover:border-gray-300 hover:shadow-md transition-all duration-300"
  >
    <div className="flex items-center justify-between mb-3">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}
      >
        <Icon className="text-lg" />
      </div>
      <FaArrowRight className="text-gray-300 group-hover:text-gray-400 text-xs transition-colors" />
    </div>
    <p className="text-2xl font-heading font-bold text-gray-800">{value}</p>
    <p className="text-gray-400 text-xs font-body mt-1">{label}</p>
    {subtitle && (
      <p className="text-gray-300 text-[10px] font-body mt-0.5">{subtitle}</p>
    )}
  </Link>
);

/* ═══════════════════════════════════════════════
   MINI SPARKLINE — simple bar chart
═══════════════════════════════════════════════ */
const SparklineChart = ({ data, height = 80 }) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="flex items-end gap-[3px]" style={{ height }}>
      {data.map((d, i) => {
        const barH = Math.max(4, (d.count / max) * height);
        const isLast = i === data.length - 1;
        return (
          <div
            key={i}
            className="flex-1 flex flex-col items-center gap-1 group relative"
          >
            <div
              className={`w-full rounded-t-sm transition-all duration-300 ${
                isLast
                  ? "bg-gradient-to-t from-saffron to-gold"
                  : "bg-saffron/20 group-hover:bg-saffron/40"
              }`}
              style={{ height: barH }}
            />
            {/* Tooltip */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-gray-800 text-white text-[9px] font-body opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
              {d.label}: {d.count}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ═══════════════════════════════════════════════
   DEVICE PILL
═══════════════════════════════════════════════ */
const DevicePill = ({ icon: Icon, label, count, total, color }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}
      >
        <Icon className="text-sm" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-heading font-semibold text-gray-700 capitalize">
            {label}
          </span>
          <span className="text-[10px] font-body text-gray-400">{pct}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-saffron to-gold transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <span className="text-sm font-heading font-bold text-gray-600">
        {count}
      </span>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   TOP BLOG ROW
═══════════════════════════════════════════════ */
const TopBlogRow = ({ rank, title, slug, views, uniqueViews }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
    <div
      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-heading font-bold flex-shrink-0 ${
        rank === 1
          ? "bg-gradient-to-br from-saffron to-gold text-navy"
          : rank === 2
            ? "bg-gray-200 text-gray-600"
            : "bg-gray-100 text-gray-400"
      }`}
    >
      {rank}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-heading font-semibold text-gray-700 truncate group-hover:text-saffron transition-colors">
        {title || slug}
      </p>
      <p className="text-[10px] font-body text-gray-400">/{slug}</p>
    </div>
    <div className="text-right flex-shrink-0">
      <p className="text-sm font-heading font-bold text-gray-700">{views}</p>
      <p className="text-[10px] font-body text-gray-400">
        {uniqueViews} unique
      </p>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════
   MAIN DASHBOARD
═══════════════════════════════════════════════ */
const Dashboard = () => {
  const [stats, setStats] = useState({
    projects: 0,
    blogs: 0,
    messages: 0,
    newMessages: 0,
    totalVisits: 0,
    uniqueVisitors: 0,
    todayVisits: 0,
    todayUnique: 0,
    weekVisits: 0,
    monthVisits: 0,
    mobileCount: 0,
    desktopCount: 0,
    tabletCount: 0,
  });
  const [recentMessages, setRecentMessages] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [topBlogs, setTopBlogs] = useState([]);
  const [blogTitles, setBlogTitles] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      // 1. Fetch basic counts
      const [projectsRes, blogsRes, messagesRes, newMsgRes, recentRes] =
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
            .from("contact_messages")
            .select("*")
            .eq("is_deleted", false)
            .order("created_at", { ascending: false })
            .limit(5),
        ]);

      // 2. Try RPC analytics, fallback to direct queries
      let analyticsData = null;
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc(
          "get_analytics_summary",
        );
        if (!rpcError && rpcData) {
          analyticsData = rpcData;
        }
      } catch {
        // RPC not available yet — use fallback
      }

      let totalVisits = 0,
        uniqueVisitors = 0,
        todayVisits = 0,
        todayUnique = 0,
        weekVisits = 0,
        monthVisits = 0,
        mobileCount = 0,
        desktopCount = 0,
        tabletCount = 0;

      if (analyticsData) {
        totalVisits = analyticsData.total_visits || 0;
        uniqueVisitors = analyticsData.unique_visitors || 0;
        todayVisits = analyticsData.today_visits || 0;
        todayUnique = analyticsData.today_unique || 0;
        weekVisits = analyticsData.this_week || 0;
        monthVisits = analyticsData.this_month || 0;
        mobileCount = analyticsData.mobile_count || 0;
        desktopCount = analyticsData.desktop_count || 0;
        tabletCount = analyticsData.tablet_count || 0;
      } else {
        // Fallback: direct queries
        const today = new Date().toISOString().split("T")[0];
        const weekAgo = subDays(new Date(), 7).toISOString();
        const monthAgo = subDays(new Date(), 30).toISOString();

        const [totalRes, todayRes, weekRes, monthRes, mobRes, deskRes, tabRes] =
          await Promise.all([
            supabase
              .from("visitors")
              .select("*", { count: "exact", head: true }),
            supabase
              .from("visitors")
              .select("*", { count: "exact", head: true })
              .gte("created_at", today),
            supabase
              .from("visitors")
              .select("*", { count: "exact", head: true })
              .gte("created_at", weekAgo),
            supabase
              .from("visitors")
              .select("*", { count: "exact", head: true })
              .gte("created_at", monthAgo),
            supabase
              .from("visitors")
              .select("*", { count: "exact", head: true })
              .eq("device_type", "mobile"),
            supabase
              .from("visitors")
              .select("*", { count: "exact", head: true })
              .eq("device_type", "desktop"),
            supabase
              .from("visitors")
              .select("*", { count: "exact", head: true })
              .eq("device_type", "tablet"),
          ]);

        totalVisits = totalRes.count || 0;
        uniqueVisitors = totalVisits; // approximate without RPC
        todayVisits = todayRes.count || 0;
        todayUnique = todayVisits;
        weekVisits = weekRes.count || 0;
        monthVisits = monthRes.count || 0;
        mobileCount = mobRes.count || 0;
        desktopCount = deskRes.count || 0;
        tabletCount = tabRes.count || 0;
      }

      setStats({
        projects: projectsRes.count || 0,
        blogs: blogsRes.count || 0,
        messages: messagesRes.count || 0,
        newMessages: newMsgRes.count || 0,
        totalVisits,
        uniqueVisitors,
        todayVisits,
        todayUnique,
        weekVisits,
        monthVisits,
        mobileCount,
        desktopCount,
        tabletCount,
      });
      setRecentMessages(recentRes.data || []);

      // 3. Fetch daily visit data for chart (last 14 days)
      try {
        const { data: rpcDaily, error: dailyErr } = await supabase.rpc(
          "get_daily_visits",
          { days_back: 14 },
        );
        if (!dailyErr && rpcDaily) {
          setDailyData(
            rpcDaily.map((d) => ({
              label: format(new Date(d.visit_date), "MMM d"),
              count: Number(d.visit_count),
              unique: Number(d.unique_count),
            })),
          );
        }
      } catch {
        // Chart just won't show data — no problem
      }

      // 4. Fetch top blogs
      try {
        const { data: rpcBlogs, error: blogErr } = await supabase.rpc(
          "get_top_blogs",
          { limit_count: 5 },
        );
        if (!blogErr && rpcBlogs) {
          setTopBlogs(rpcBlogs);
          // Fetch blog titles for the slugs
          const slugs = rpcBlogs.map((b) => b.slug);
          if (slugs.length > 0) {
            const { data: blogData } = await supabase
              .from("blog_posts")
              .select("slug, title")
              .in("slug", slugs);
            if (blogData) {
              const titleMap = {};
              blogData.forEach((b) => {
                titleMap[b.slug] = b.title;
              });
              setBlogTitles(titleMap);
            }
          }
        }
      } catch {
        // Top blogs just won't show
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Realtime: update stats when new visitors come in
  useEffect(() => {
    const channel = supabase
      .channel("dashboard-visitors")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "visitors" },
        () => {
          setStats((prev) => ({
            ...prev,
            totalVisits: prev.totalVisits + 1,
            todayVisits: prev.todayVisits + 1,
          }));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-saffron border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalDevices =
    stats.mobileCount + stats.desktopCount + stats.tabletCount;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-800">
            Dashboard
          </h1>
          <p className="text-gray-400 text-sm font-body mt-1">
            Portfolio overview & analytics
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-body text-gray-400">
          <div className="relative flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="absolute w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping opacity-75" />
          </div>
          Live
        </div>
      </div>

      {/* ═══ TOP STATS GRID ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FaUsers}
          label="Unique Visitors"
          value={stats.uniqueVisitors.toLocaleString()}
          color="bg-emerald-500/15 text-emerald-500"
          to="/admin"
          subtitle={`${stats.totalVisits.toLocaleString()} total visits`}
        />
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
          subtitle={`${stats.messages} total`}
        />
      </div>

      {/* ═══ ANALYTICS ROW ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Visit Chart */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FaChartLine className="text-saffron text-sm" />
              <h2 className="text-base font-heading font-bold text-gray-800">
                Visitor Traffic
              </h2>
            </div>
            <span className="text-[10px] font-body text-gray-400 uppercase tracking-wider">
              Last 14 days
            </span>
          </div>

          {dailyData.length > 0 ? (
            <SparklineChart data={dailyData} height={100} />
          ) : (
            <div className="flex items-center justify-center h-[100px] text-gray-300 text-sm font-body">
              <p>Chart data will appear after running the SQL migration</p>
            </div>
          )}

          {/* Quick stats row */}
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <p className="text-lg font-heading font-bold text-gray-800">
                {stats.todayVisits}
              </p>
              <p className="text-[10px] font-body text-gray-400">Today</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-heading font-bold text-gray-800">
                {stats.weekVisits}
              </p>
              <p className="text-[10px] font-body text-gray-400">This Week</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-heading font-bold text-gray-800">
                {stats.monthVisits}
              </p>
              <p className="text-[10px] font-body text-gray-400">This Month</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-heading font-bold text-saffron">
                {stats.uniqueVisitors}
              </p>
              <p className="text-[10px] font-body text-gray-400">
                Unique Total
              </p>
            </div>
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <FaGlobeAsia className="text-saffron text-sm" />
            <h2 className="text-base font-heading font-bold text-gray-800">
              Devices
            </h2>
          </div>

          {totalDevices > 0 ? (
            <div className="space-y-3">
              <DevicePill
                icon={FaDesktop}
                label="Desktop"
                count={stats.desktopCount}
                total={totalDevices}
                color="bg-blue-500/15 text-blue-400"
              />
              <DevicePill
                icon={FaMobileAlt}
                label="Mobile"
                count={stats.mobileCount}
                total={totalDevices}
                color="bg-purple-500/15 text-purple-400"
              />
              <DevicePill
                icon={FaTabletAlt}
                label="Tablet"
                count={stats.tabletCount}
                total={totalDevices}
                color="bg-emerald-500/15 text-emerald-400"
              />
            </div>
          ) : (
            <p className="text-gray-300 text-sm font-body py-8 text-center">
              Device data will appear after SQL migration
            </p>
          )}
        </div>
      </div>

      {/* ═══ BOTTOM ROW — Top Blogs + Recent Messages ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Blog Posts */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FaFire className="text-saffron text-sm" />
              <h2 className="text-base font-heading font-bold text-gray-800">
                Most Viewed Posts
              </h2>
            </div>
            <Link
              to="/admin/blog"
              className="text-saffron text-xs font-body hover:underline flex items-center gap-1"
            >
              All posts <FaArrowRight className="text-[10px]" />
            </Link>
          </div>

          {topBlogs.length > 0 ? (
            <div className="space-y-1">
              {topBlogs.map((blog, i) => (
                <TopBlogRow
                  key={blog.slug}
                  rank={i + 1}
                  title={blogTitles[blog.slug]}
                  slug={blog.slug}
                  views={Number(blog.view_count)}
                  uniqueViews={Number(blog.unique_views)}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-300 text-sm font-body py-8 text-center">
              Blog view data will appear once visitors read your posts
            </p>
          )}
        </div>

        {/* Recent Messages */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FaEnvelope className="text-saffron text-sm" />
              <h2 className="text-base font-heading font-bold text-gray-800">
                Recent Messages
              </h2>
            </div>
            <Link
              to="/admin/messages"
              className="text-saffron text-xs font-body hover:underline flex items-center gap-1"
            >
              View all <FaArrowRight className="text-[10px]" />
            </Link>
          </div>

          {recentMessages.length === 0 ? (
            <p className="text-gray-300 text-sm font-body py-8 text-center">
              No messages yet
            </p>
          ) : (
            <div className="space-y-1">
              {recentMessages.map((msg) => {
                const date = new Date(msg.created_at);
                const dateLabel = isToday(date)
                  ? "Today"
                  : isYesterday(date)
                    ? "Yesterday"
                    : format(date, "MMM d");
                return (
                  <div
                    key={msg.id}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        msg.status === "new"
                          ? "bg-saffron/20 text-saffron"
                          : msg.status === "replied"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {msg.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-gray-800 text-sm font-heading font-semibold truncate">
                          {msg.name}
                        </p>
                        {msg.status === "new" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-saffron flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-gray-500 text-xs font-body truncate">
                        {msg.subject || msg.message}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-gray-300 text-[10px] font-body flex-shrink-0">
                      <FaClock className="text-[8px]" />
                      {dateLabel}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
