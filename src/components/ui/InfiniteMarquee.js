import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

/**
 * InfiniteMarquee — Auto-scrolling horizontal ticker.
 * Duplicates children to create a seamless infinite loop.
 * Configurable speed, direction, and pause-on-hover.
 */

const defaultItems = [
  "Indian History",
  "BPSC Preparation",
  "Indian Polity",
  "Teaching Pedagogy",
  "Bihar GK",
  "Child Psychology",
  "Public Speaking",
  "Critical Thinking",
  "Geography",
  "B.Ed Studies",
  "Essay Writing",
  "Ethics & Integrity",
  "Current Affairs",
  "Classroom Management",
  "Time Management",
  "Indian Economy",
];

const InfiniteMarquee = ({
  items = defaultItems,
  speed = 30,
  direction = "left",
  pauseOnHover = true,
  className = "",
}) => {
  const { darkMode } = useTheme();

  // Duration based on speed (lower = faster)
  const duration = items.length * (100 / speed);

  // Build a duplicated list for seamless loop
  const duplicated = [...items, ...items];

  return (
    <div
      className={`relative w-full overflow-hidden py-6 ${className}`}
      aria-hidden="true"
    >
      {/* Fade edges */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none ${
          darkMode
            ? "bg-gradient-to-r from-navy to-transparent"
            : "bg-gradient-to-r from-[#f8fafc] to-transparent"
        }`}
      />
      <div
        className={`absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none ${
          darkMode
            ? "bg-gradient-to-l from-navy to-transparent"
            : "bg-gradient-to-l from-[#f8fafc] to-transparent"
        }`}
      />

      {/* Scrolling track */}
      <motion.div
        className={`flex gap-6 w-max ${pauseOnHover ? "hover:[animation-play-state:paused]" : ""}`}
        animate={{
          x: direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration,
            ease: "linear",
          },
        }}
        style={{ willChange: "transform" }}
      >
        {duplicated.map((item, i) => (
          <div
            key={i}
            className={`flex-shrink-0 flex items-center gap-2 px-6 py-2.5 rounded-full
              border font-heading text-sm font-medium tracking-wide whitespace-nowrap
              transition-colors duration-300
              ${
                darkMode
                  ? "border-saffron/20 text-saffron-light/80 bg-saffron/[0.04] hover:bg-saffron/10 hover:border-saffron/40"
                  : "border-saffron/30 text-saffron-dark bg-saffron/[0.06] hover:bg-saffron/15 hover:border-saffron/50"
              }`}
          >
            {/* Saffron dot */}
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                darkMode ? "bg-saffron/60" : "bg-saffron-dark/60"
              }`}
            />
            {item}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default InfiniteMarquee;
