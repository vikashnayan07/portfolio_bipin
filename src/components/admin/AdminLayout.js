import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
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
  FaChevronRight,
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
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newMsgCount, setNewMsgCount] = useState(0);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

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

    const channel = supabase
      .channel("admin-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "contact_messages" },
        () => {
          setNewMsgCount((prev) => prev + 1);
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "contact_messages" },
        () => {
          fetchCount();
        },
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

  // Get current page title
  const currentPage = navItems.find(
    (item) =>
      item.end
        ? location.pathname === item.to
        : location.pathname.startsWith(item.to) && item.to !== "/admin",
  ) || navItems[0];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ═══ SIDEBAR ═══ */}
      <aside
        className={`fixed lg:static z-50 top-0 left-0 h-full w-[280px] bg-white border-r border-gray-100
          flex flex-col transition-transform duration-300 ease-out lg:translate-x-0 shadow-2xl lg:shadow-none ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Logo */}
        <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-200">
              <span className="text-white font-extrabold text-sm">BK</span>
            </div>
            <div>
              <h2 className="text-gray-900 font-bold text-sm tracking-tight">
                Admin Panel
              </h2>
              <p className="text-gray-400 text-[10px] font-medium">
                bipinoberoy.me
              </p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-3">
            Menu
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 font-semibold shadow-sm border border-amber-100"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    isActive ? "bg-amber-500 text-white shadow-md shadow-amber-200" : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
                  }`}>
                    <item.icon className="text-sm" />
                  </div>
                  <span className="flex-1">{item.label}</span>
                  {item.label === "Messages" && newMsgCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[22px] text-center shadow-sm shadow-red-200">
                      {newMsgCount}
                    </span>
                  )}
                  {isActive && (
                    <FaChevronRight className="text-amber-400 text-[10px]" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User / Sign out */}
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gray-50 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
              <FaUser className="text-white text-xs" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-800 text-xs font-semibold truncate">
                {user?.email}
              </p>
              <p className="text-gray-400 text-[10px] font-medium">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium
              text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
          >
            <FaSignOutAlt />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-4 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-800 p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <FaBars className="text-lg" />
            </button>

            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="text-gray-400">Admin</span>
              <FaChevronRight className="text-gray-300 text-[8px]" />
              <span className="text-gray-700 font-semibold">{currentPage.label}</span>
            </div>
            <span className="sm:hidden text-gray-800 font-semibold text-sm">{currentPage.label}</span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notification bell */}
            <button
              onClick={() => navigate("/admin/messages")}
              className="relative p-2.5 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all"
            >
              <FaBell className="text-lg" />
              {newMsgCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white" />
              )}
            </button>

            {/* User avatar (visible on desktop) */}
            <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <FaUser className="text-white text-[10px]" />
              </div>
              <span className="text-gray-600 text-xs font-medium max-w-[120px] truncate">
                {user?.email?.split("@")[0]}
              </span>
            </div>
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
