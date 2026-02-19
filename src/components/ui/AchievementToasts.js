import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

/**
 * AchievementToasts — Gaming-style "Achievement Unlocked!" toasts
 * that trigger as users scroll past certain sections.
 */

const achievementData = [
  {
    sectionId: "about",
    title: "Origin Story Discovered",
    description: "You explored Bipin's journey!",
    icon: "🏆",
    xp: "+50 XP",
  },
  {
    sectionId: "projects",
    title: "Project Explorer",
    description: "You checked out the projects!",
    icon: "💻",
    xp: "+75 XP",
  },
  {
    sectionId: "skills",
    title: "Skill Scanner Activated",
    description: "You analyzed Bipin's skill tree!",
    icon: "⚡",
    xp: "+60 XP",
  },
  {
    sectionId: "blog",
    title: "Knowledge Seeker",
    description: "You found the blog insights!",
    icon: "📚",
    xp: "+40 XP",
  },
  {
    sectionId: "contact",
    title: "Connection Initiated",
    description: "You reached the contact zone!",
    icon: "🤝",
    xp: "+100 XP",
  },
];

const STORAGE_KEY = "bipin-achievements-unlocked";

/* ─── Single Toast Notification ─── */
const AchievementToast = ({ achievement, onDismiss, darkMode }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ x: 400, opacity: 0, scale: 0.8 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: 400, opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl max-w-xs cursor-pointer
        border backdrop-blur-xl
        ${
          darkMode
            ? "bg-navy-light/90 border-saffron/20 shadow-saffron/10"
            : "bg-white/90 border-saffron/25 shadow-saffron/10"
        }`}
      onClick={onDismiss}
    >
      {/* Icon */}
      <motion.div
        initial={{ rotate: -30, scale: 0 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
        className="text-3xl flex-shrink-0 mt-0.5"
      >
        {achievement.icon}
      </motion.div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2 mb-0.5"
        >
          <span
            className={`text-[10px] font-heading font-bold tracking-wider uppercase
            ${darkMode ? "text-saffron" : "text-saffron-dark"}`}
          >
            Achievement Unlocked!
          </span>
        </motion.div>

        <h4
          className={`text-sm font-heading font-bold leading-tight
          ${darkMode ? "text-white" : "text-navy"}`}
        >
          {achievement.title}
        </h4>

        <p
          className={`text-[11px] font-body mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
        >
          {achievement.description}
        </p>

        {/* XP Badge */}
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
          className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-heading font-bold
            bg-gradient-to-r from-saffron to-gold text-navy"
        >
          {achievement.xp}
        </motion.span>
      </div>

      {/* Progress bar animation */}
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 rounded-b-2xl bg-gradient-to-r from-saffron to-gold"
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: 4, ease: "linear" }}
      />
    </motion.div>
  );
};

/* ─── Toast Manager ─── */
const AchievementToasts = () => {
  const { darkMode } = useTheme();
  const [activeToasts, setActiveToasts] = useState([]);
  const unlockedRef = useRef(new Set());

  // Load previously unlocked achievements
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      saved.forEach((id) => unlockedRef.current.add(id));
    } catch {
      // ignore
    }
  }, []);

  // Save on unlock
  const saveUnlocked = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...unlockedRef.current]));
  }, []);

  // Set up IntersectionObservers for each section
  useEffect(() => {
    const observers = [];

    achievementData.forEach((achievement) => {
      const el = document.getElementById(achievement.sectionId);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (
            entry.isIntersecting &&
            !unlockedRef.current.has(achievement.sectionId)
          ) {
            unlockedRef.current.add(achievement.sectionId);
            saveUnlocked();

            setActiveToasts((prev) => [
              ...prev,
              { ...achievement, key: Date.now() },
            ]);
          }
        },
        { threshold: 0.3 },
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [saveUnlocked]);

  const dismissToast = useCallback((key) => {
    setActiveToasts((prev) => prev.filter((t) => t.key !== key));
  }, []);

  return (
    <div className="fixed top-20 right-4 z-[990] flex flex-col gap-3">
      <AnimatePresence>
        {activeToasts.map((toast) => (
          <AchievementToast
            key={toast.key}
            achievement={toast}
            darkMode={darkMode}
            onDismiss={() => dismissToast(toast.key)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default AchievementToasts;
