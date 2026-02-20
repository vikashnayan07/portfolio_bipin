import React, { useRef, useCallback, useState, useEffect } from "react";
/* eslint-disable react-hooks/exhaustive-deps */
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

const PROXIMITY = 120; // pixel radius of magnification influence

/* ─── Single Dock Icon ─── */
const DockIcon = ({ item, mouseX, darkMode, baseSize, maxSize }) => {
  const ref = useRef(null);

  // Distance from mouse to this icon's center → size
  const distance = useMotionValue(PROXIMITY);

  const sizeSpring = useSpring(baseSize, {
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
        baseSize,
        maxSize - ((maxSize - baseSize) * Math.min(d, PROXIMITY)) / PROXIMITY,
      );
      sizeSpring.set(scale);
    },
    [distance, sizeSpring, baseSize, maxSize],
  );

  // Subscribe to parent mouseX
  React.useEffect(() => {
    const unsub = mouseX.on("change", (v) => {
      if (v < 0) {
        sizeSpring.set(baseSize);
      } else {
        updateDistance(v);
      }
    });
    return unsub;
  }, [mouseX, sizeSpring, updateDistance, baseSize]);

  const width = sizeSpring;
  const height = sizeSpring;

  const iconSize = useTransform(sizeSpring, [baseSize, maxSize], [14, 24]);

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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activeId, setActiveId] = useState("hero");
  const itemRefs = useRef({});

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* ── Track active section via IntersectionObserver ── */
  useEffect(() => {
    const ids = dockItems.map((d) => d.id);
    const observers = [];

    const handleIntersect = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    };

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(handleIntersect, {
        rootMargin: "-40% 0px -55% 0px",
        threshold: 0,
      });
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const baseSize = isMobile ? 32 : 40;
  const maxSize = isMobile ? 32 : 60;

  const handleMouseMove = useCallback((e) => mouseX.set(e.clientX), [mouseX]);

  const handleMouseLeave = useCallback(() => mouseX.set(-1), [mouseX]);

  return (
    <div className="fixed bottom-5 left-0 right-0 z-[980] flex justify-center pointer-events-none">
      <motion.nav
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 2, duration: 0.6, type: "spring", stiffness: 120 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`relative pointer-events-auto flex items-end gap-1 md:gap-1.5 px-2 md:px-3 py-1.5 md:py-2
          rounded-2xl border backdrop-blur-xl shadow-lg
          ${
            darkMode
              ? "bg-navy/60 border-white/10 shadow-black/30"
              : "bg-white/70 border-gray-200 shadow-gray-300/40"
          }`}
      >
        {dockItems.map((item, i) => (
          <div
            key={item.id}
            ref={(el) => (itemRefs.current[item.id] = el)}
            className="group relative flex flex-col items-center"
          >
            <DockIcon
              item={item}
              mouseX={mouseX}
              darkMode={darkMode}
              baseSize={baseSize}
              maxSize={maxSize}
            />
            {/* Per-icon active dot indicator */}
            <motion.div
              initial={false}
              animate={{
                opacity: activeId === item.id ? 1 : 0,
                scale: activeId === item.id ? 1 : 0,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute -bottom-1.5 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-saffron to-gold"
            />
          </div>
        ))}
      </motion.nav>
    </div>
  );
};

export default FloatingDock;
