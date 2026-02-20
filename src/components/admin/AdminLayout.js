import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import {
  FaHome,
  FaUser,
  FaProjectDiagram,
  FaPenNib,
  FaEnvelope,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaBell,
} from "react-icons/fa";

const navItems = [
  { to: "/admin", icon: FaHome, label: "Dashboard", end: true },
  { to: "/admin/profile", icon: FaUser, label: "Profile" },
  { to: "/admin/projects", icon: FaProjectDiagram, label: "Projects" },
  { to: "/admin/blog", icon: FaPenNib, label: "Blog" },
  { to: "/admin/messages", icon: FaEnvelope, label: "Messages" },
];

const AdminLayout = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newMsgCount, setNewMsgCount] = useState(0);

  /* ── Realtime new message count ── */
  useEffect(() => {
    const fetchCount = async () => {
      const { count } = await supabase
        .from("contact_messages")
        .select("*", { count: "exact", head: true })
        .eq("status", "new")
        .eq("is_deleted", false);
      setNewMsgCount(count || 0);
    };
    fetchCount();

    // Subscribe to realtime inserts
    const channel = supabase
      .channel("admin-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "contact_messages" },
        () => {
          setNewMsgCount((prev) => prev + 1);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "contact_messages" },
        () => {
          fetchCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-body transition-all duration-200 ${
      isActive
        ? "bg-saffron/15 text-saffron font-semibold"
        : "text-white/50 hover:text-white/80 hover:bg-white/5"
    }`;

  return (
    <div className="min-h-screen bg-[#0A192F] flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static z-50 top-0 left-0 h-full w-64 bg-[#0d1f3c] border-r border-white/5
          flex flex-col transition-transform duration-300 lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-saffron to-gold flex items-center justify-center">
              <span className="text-white font-bold text-sm">BK</span>
            </div>
            <div>
              <h2 className="text-white font-heading font-bold text-sm">Admin</h2>
              <p className="text-white/30 text-[10px] font-body">Portfolio Manager</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/40 hover:text-white"
          >
            <FaTimes />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={linkClass}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="text-base" />
              {item.label}
              {item.label === "Messages" && newMsgCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {newMsgCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User / Sign out */}
        <div className="px-3 py-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-saffron/20 flex items-center justify-center">
              <FaUser className="text-saffron text-xs" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white/80 text-xs font-heading font-semibold truncate">
                {user?.email}
              </p>
              <p className="text-white/30 text-[10px] font-body">Admin</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-body
              text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <FaSignOutAlt />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-[#0A192F]/80 backdrop-blur-xl border-b border-white/5 px-4 lg:px-8 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-white/60 hover:text-white p-2"
          >
            <FaBars className="text-lg" />
          </button>

          <div className="flex-1" />

          {/* Notification bell */}
          <div className="relative">
            <button
              onClick={() => navigate("/admin/messages")}
              className="text-white/40 hover:text-saffron transition-colors p-2 relative"
            >
              <FaBell className="text-lg" />
              {newMsgCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
              )}
            </button>
          </div>
        </header>

        {/* Page body */}
        <main className="flex-1 px-4 lg:px-8 py-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
