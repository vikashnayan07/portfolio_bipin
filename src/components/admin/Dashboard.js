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
  FaArrowUp,
  FaEye,
} from "react-icons/fa";
import { format, subDays, isToday, isYesterday } from "date-fns";

/* ═══════════════════════════════════════════════
   STAT CARD — glassmorphism style
═══════════════════════════════════════════════ */
const StatCard = ({
  icon: Icon,
  label,
  value,
  color,
  bgGrad,
  to,
  subtitle,
  trend,
}) => (
  <Link
    to={to}
    className="group relative overflow-hidden bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
  >
    {/* Accent gradient blob */}
    <div
      className={`absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-10 ${bgGrad} blur-2xl group-hover:opacity-20 transition-opacity`}
    />

    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color} shadow-sm`}
        >
          <Icon className="text-lg" />
        </div>
        {trend && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold">
            <FaArrowUp className="text-[8px]" />
            {trend}
          </div>
        )}
      </div>
      <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
        {value}
      </p>
      <p className="text-gray-500 text-xs font-medium mt-1">{label}</p>
      {subtitle && (
        <p className="text-gray-400 text-[11px] mt-0.5">{subtitle}</p>
      )}
    </div>

    {/* Hover arrow */}
    <div className="absolute bottom-5 right-5 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0 -translate-x-2">
      <FaArrowRight className="text-gray-400 text-xs" />
    </div>
  </Link>
);

/* ═══════════════════════════════════════════════
   SPARKLINE BAR CHART
═══════════════════════════════════════════════ */
const SparklineChart = ({ data, height = 100 }) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="flex items-end gap-1 sm:gap-1.5" style={{ height }}>
      {data.map((d, i) => {
        const barH = Math.max(6, (d.count / max) * height);
        const isLast = i === data.length - 1;
        return (
          <div
            key={i}
            className="flex-1 flex flex-col items-center gap-1 group relative"
          >
            <div
              className={`w-full rounded-lg transition-all duration-500 cursor-pointer ${
                isLast
                  ? "bg-gradient-to-t from-amber-500 to-orange-400 shadow-md shadow-amber-200"
                  : "bg-gradient-to-t from-amber-100 to-amber-50 group-hover:from-amber-200 group-hover:to-amber-100"
              }`}
              style={{ height: barH }}
            />
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1.5 rounded-lg bg-gray-900 text-white text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-xl">
              {d.label}: <span className="font-bold">{d.count}</span>
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ═══════════════════════════════════════════════
   DEVICE PROGRESS BAR
═══════════════════════════════════════════════ */
const DeviceBar = ({
  icon: Icon,
  label,
  count,
  total,
  color,
  gradFrom,
  gradTo,
}) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-4 p-3.5 rounded-xl hover:bg-gray-50 transition-colors">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} shadow-sm`}
      >
        <Icon className="text-base" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700 capitalize">
            {label}
          </span>
          <span className="text-xs font-bold text-gray-900">{pct}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${gradFrom} ${gradTo} transition-all duration-1000`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <span className="text-sm font-bold text-gray-600 min-w-[36px] text-right">
        {count}
      </span>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   TOP BLOG ROW
═══════════════════════════════════════════════ */
const TopBlogRow = ({ rank, title, slug, views, uniqueViews }) => (
  <div className="flex items-center gap-3.5 p-3.5 rounded-xl hover:bg-gray-50 transition-colors group">
    <div
      className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-extrabold flex-shrink-0 shadow-sm ${
        rank === 1
          ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white"
          : rank === 2
            ? "bg-gradient-to-br from-gray-300 to-gray-400 text-white"
            : rank === 3
              ? "bg-gradient-to-br from-amber-600 to-amber-700 text-white"
              : "bg-gray-100 text-gray-500"
      }`}
    >
      #{rank}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-amber-600 transition-colors">
        {title || slug}
      </p>
      <p className="text-[11px] text-gray-400">/{slug}</p>
    </div>
    <div className="text-right flex-shrink-0">
      <div className="flex items-center gap-1">
        <FaEye className="text-gray-400 text-[10px]" />
        <p className="text-sm font-bold text-gray-800">{views}</p>
      </div>
      <p className="text-[10px] text-gray-400">{uniqueViews} unique</p>
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

      let analyticsData = null;
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc(
          "get_analytics_summary",
        );
        if (!rpcError && rpcData) {
          analyticsData = rpcData;
        }
      } catch {
        // RPC not available
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
        uniqueVisitors = totalVisits;
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

      // Daily visits chart
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
        // no chart data
      }

      // Top blogs
      try {
        const { data: rpcBlogs, error: blogErr } = await supabase.rpc(
          "get_top_blogs",
          { limit_count: 5 },
        );
        if (!blogErr && rpcBlogs) {
          setTopBlogs(rpcBlogs);
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
        // no top blogs
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
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const totalDevices =
    stats.mobileCount + stats.desktopCount + stats.tabletCount;

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* ═══ HEADER ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Welcome back! Here's what's happening with your portfolio.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
            <div className="relative">
              <span className="w-2 h-2 rounded-full bg-emerald-500 block" />
              <span className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping opacity-60" />
            </div>
            <span className="text-emerald-700 text-xs font-semibold">Live</span>
          </div>
          <span className="text-gray-400 text-xs hidden sm:block">
            {format(new Date(), "MMM d, yyyy")}
          </span>
        </div>
      </div>

      {/* ═══ TOP STATS GRID ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <StatCard
          icon={FaUsers}
          label="Unique Visitors"
          value={stats.uniqueVisitors.toLocaleString()}
          color="bg-emerald-100 text-emerald-600"
          bgGrad="bg-emerald-500"
          to="/admin"
          subtitle={`${stats.totalVisits.toLocaleString()} total visits`}
        />
        <StatCard
          icon={FaProjectDiagram}
          label="Total Projects"
          value={stats.projects}
          color="bg-blue-100 text-blue-600"
          bgGrad="bg-blue-500"
          to="/admin/projects"
        />
        <StatCard
          icon={FaPenNib}
          label="Blog Posts"
          value={stats.blogs}
          color="bg-violet-100 text-violet-600"
          bgGrad="bg-violet-500"
          to="/admin/blog"
        />
        <StatCard
          icon={FaEnvelope}
          label="Messages"
          value={
            stats.newMessages > 0 ? `${stats.newMessages} new` : stats.messages
          }
          color="bg-amber-100 text-amber-600"
          bgGrad="bg-amber-500"
          to="/admin/messages"
          subtitle={
            stats.newMessages > 0 ? `${stats.messages} total` : undefined
          }
        />
      </div>

      {/* ═══ ANALYTICS ROW ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Visit Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <FaChartLine className="text-amber-600" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  Visitor Traffic
                </h2>
                <p className="text-gray-400 text-xs">Last 14 days</p>
              </div>
            </div>
          </div>

          {dailyData.length > 0 ? (
            <SparklineChart data={dailyData} height={120} />
          ) : (
            <div className="flex items-center justify-center h-[120px] text-gray-300 text-sm">
              <p>Chart data will appear after SQL migration</p>
            </div>
          )}

          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-gray-100">
            {[
              { label: "Today", value: stats.todayVisits, icon: "🔥" },
              { label: "This Week", value: stats.weekVisits, icon: "📈" },
              { label: "This Month", value: stats.monthVisits, icon: "📊" },
              { label: "All Time", value: stats.uniqueVisitors, icon: "👥" },
            ].map((item) => (
              <div
                key={item.label}
                className="text-center p-3 rounded-xl bg-gray-50"
              >
                <p className="text-lg sm:text-xl font-extrabold text-gray-900">
                  {item.value.toLocaleString()}
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <FaGlobeAsia className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                Devices
              </h2>
              <p className="text-gray-400 text-xs">{totalDevices} total</p>
            </div>
          </div>

          {totalDevices > 0 ? (
            <div className="space-y-2">
              <DeviceBar
                icon={FaDesktop}
                label="Desktop"
                count={stats.desktopCount}
                total={totalDevices}
                color="bg-blue-100 text-blue-600"
                gradFrom="from-blue-400"
                gradTo="to-blue-500"
              />
              <DeviceBar
                icon={FaMobileAlt}
                label="Mobile"
                count={stats.mobileCount}
                total={totalDevices}
                color="bg-violet-100 text-violet-600"
                gradFrom="from-violet-400"
                gradTo="to-violet-500"
              />
              <DeviceBar
                icon={FaTabletAlt}
                label="Tablet"
                count={stats.tabletCount}
                total={totalDevices}
                color="bg-emerald-100 text-emerald-600"
                gradFrom="from-emerald-400"
                gradTo="to-emerald-500"
              />
            </div>
          ) : (
            <p className="text-gray-300 text-sm py-8 text-center">
              Device data will appear after SQL migration
            </p>
          )}
        </div>
      </div>

      {/* ═══ BOTTOM ROW ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Top Blog Posts */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <FaFire className="text-orange-600" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                Most Viewed Posts
              </h2>
            </div>
            <Link
              to="/admin/blog"
              className="text-amber-600 text-xs font-semibold hover:text-amber-700 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-amber-50 transition-colors"
            >
              All Posts <FaArrowRight className="text-[10px]" />
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
            <p className="text-gray-300 text-sm py-8 text-center">
              Blog view data will appear once visitors read your posts
            </p>
          )}
        </div>

        {/* Recent Messages */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <FaEnvelope className="text-blue-600" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                Recent Messages
              </h2>
            </div>
            <Link
              to="/admin/messages"
              className="text-amber-600 text-xs font-semibold hover:text-amber-700 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-amber-50 transition-colors"
            >
              View All <FaArrowRight className="text-[10px]" />
            </Link>
          </div>

          {recentMessages.length === 0 ? (
            <p className="text-gray-300 text-sm py-8 text-center">
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
                  <Link
                    key={msg.id}
                    to="/admin/messages"
                    className="flex items-start gap-3.5 p-3.5 rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-sm ${
                        msg.status === "new"
                          ? "bg-gradient-to-br from-amber-400 to-orange-400 text-white"
                          : msg.status === "replied"
                            ? "bg-emerald-100 text-emerald-600"
                            : msg.status === "user_replied"
                              ? "bg-violet-100 text-violet-600"
                              : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {msg.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-gray-900 text-sm font-semibold truncate group-hover:text-amber-600 transition-colors">
                          {msg.name}
                        </p>
                        {msg.status === "new" && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                        )}
                        {msg.status === "user_replied" && (
                          <span className="px-1.5 py-0.5 text-[8px] font-bold bg-violet-100 text-violet-600 rounded-full uppercase">
                            Reply
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 text-xs truncate mt-0.5">
                        {msg.subject || msg.message?.slice(0, 60)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400 text-[11px] flex-shrink-0">
                      <FaClock className="text-[9px]" />
                      {dateLabel}
                    </div>
                  </Link>
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
