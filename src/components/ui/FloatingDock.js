import React, { useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import {
  FaHome,
  FaUser,
  FaProjectDiagram,
  FaCogs,
  FaPenNib,
  FaEnvelope,
  FaMapMarkedAlt,
} from "react-icons/fa";

/* ─── Dock Config ─── */
const dockItems = [
  { id: "hero", icon: FaHome, label: "Home" },
  { id: "about", icon: FaUser, label: "About" },
  { id: "projects", icon: FaProjectDiagram, label: "Projects" },
  { id: "skills", icon: FaCogs, label: "Skills" },
  { id: "bihar-map", icon: FaMapMarkedAlt, label: "Bihar" },
  { id: "blog", icon: FaPenNib, label: "Blog" },
  { id: "contact", icon: FaEnvelope, label: "Contact" },
];

const BASE_SIZE = 40; // resting icon wrapper size (px)
const MAX_SIZE = 60; // magnified size
const PROXIMITY = 120; // pixel radius of magnification influence

/* ─── Single Dock Icon ─── */
const DockIcon = ({ item, mouseX, darkMode }) => {
  const ref = useRef(null);

  // Distance from mouse to this icon's center → size
  const distance = useMotionValue(PROXIMITY);

  const sizeSpring = useSpring(BASE_SIZE, {
    stiffness: 260,
    damping: 20,
    mass: 0.6,
  });

  // When parent updates mouseX, compute distance & drive sizeSpring
  const updateDistance = useCallback(
    (mx) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const d = Math.abs(mx - center);
      distance.set(d);
      const scale = Math.max(
        BASE_SIZE,
        MAX_SIZE -
          ((MAX_SIZE - BASE_SIZE) * Math.min(d, PROXIMITY)) / PROXIMITY,
      );
      sizeSpring.set(scale);
    },
    [distance, sizeSpring],
  );

  // Subscribe to parent mouseX
  React.useEffect(() => {
    const unsub = mouseX.on("change", (v) => {
      if (v < 0) {
        sizeSpring.set(BASE_SIZE);
      } else {
        updateDistance(v);
      }
    });
    return unsub;
  }, [mouseX, sizeSpring, updateDistance]);

  const width = sizeSpring;
  const height = sizeSpring;

  const iconSize = useTransform(sizeSpring, [BASE_SIZE, MAX_SIZE], [16, 24]);

  const scrollTo = () => {
    const el = document.getElementById(item.id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <motion.button
      ref={ref}
      onClick={scrollTo}
      style={{ width, height }}
      whileTap={{ scale: 0.85 }}
      className={`relative flex items-center justify-center rounded-xl transition-colors duration-200
        ${
          darkMode
            ? "bg-white/10 hover:bg-saffron/30 text-white/70 hover:text-saffron"
            : "bg-gray-100 hover:bg-saffron/20 text-gray-600 hover:text-saffron"
        }`}
      aria-label={`Scroll to ${item.label}`}
    >
      <motion.span
        style={{ fontSize: iconSize }}
        className="flex items-center justify-center"
      >
        <item.icon />
      </motion.span>

      {/* Tooltip */}
      <span
        className={`absolute -top-8 px-2 py-0.5 rounded text-[10px] font-heading font-semibold
          opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap
          transition-opacity duration-200
          ${darkMode ? "bg-white/10 text-white" : "bg-gray-800 text-white"}`}
      >
        {item.label}
      </span>
    </motion.button>
  );
};

/* ─── Floating Dock ─── */
const FloatingDock = () => {
  const { darkMode } = useTheme();
  const mouseX = useMotionValue(-1);

  const handleMouseMove = useCallback((e) => mouseX.set(e.clientX), [mouseX]);

  const handleMouseLeave = useCallback(() => mouseX.set(-1), [mouseX]);

  return (
    <motion.nav
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 2, duration: 0.6, type: "spring", stiffness: 120 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-[980] flex items-end gap-1.5 px-3 py-2
        rounded-2xl border backdrop-blur-xl shadow-lg
        ${
          darkMode
            ? "bg-navy/60 border-white/10 shadow-black/30"
            : "bg-white/70 border-gray-200 shadow-gray-300/40"
        }`}
    >
      {dockItems.map((item) => (
        <div
          key={item.id}
          className="group relative flex flex-col items-center"
        >
          <DockIcon item={item} mouseX={mouseX} darkMode={darkMode} />
        </div>
      ))}

      {/* Active indicator line */}
      <div
        className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full
          bg-gradient-to-r from-saffron to-gold`}
      />
    </motion.nav>
  );
};

export default FloatingDock;
