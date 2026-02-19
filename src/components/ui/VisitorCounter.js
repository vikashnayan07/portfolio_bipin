import React, { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

/**
 * VisitorCounter — "You're visitor #XXXX" live counter.
 * Uses localStorage for demo persistence.
 * Includes odometer-style digit roll animation.
 */

const STORAGE_KEY = "bipin-portfolio-visitor-count";
const STORAGE_VISIT_KEY = "bipin-portfolio-visited";

const getVisitorCount = () => {
  let count = parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
  const hasVisited = sessionStorage.getItem(STORAGE_VISIT_KEY);

  if (!hasVisited) {
    // First visit this session — increment
    count += 1;
    localStorage.setItem(STORAGE_KEY, String(count));
    sessionStorage.setItem(STORAGE_VISIT_KEY, "true");
  }

  // Start from a realistic base number for social proof
  return count + 1247;
};

/* ─── Single Digit Roller ─── */
const DigitRoller = ({ digit, delay = 0, darkMode }) => {
  return (
    <div className="relative h-8 w-[1.1ch] overflow-hidden">
      <motion.div
        initial={{ y: "-100%" }}
        animate={{ y: `${-digit * 10}%` }}
        transition={{
          duration: 1.2,
          delay,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
        className="flex flex-col"
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <span
            key={n}
            className={`h-8 flex items-center justify-center text-xl font-heading font-bold tabular-nums
              ${darkMode ? "text-saffron-light" : "text-saffron-dark"}`}
          >
            {n}
          </span>
        ))}
      </motion.div>
    </div>
  );
};

const VisitorCounter = ({ className = "" }) => {
  const { darkMode } = useTheme();
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    setCount(getVisitorCount());
  }, []);

  const digits = String(count).padStart(4, "0").split("").map(Number);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className={`inline-flex items-center gap-3 px-5 py-3 rounded-2xl
        ${
          darkMode ? "glass border-saffron/10" : "glass-light border-saffron/15"
        } ${className}`}
    >
      {/* Live pulse dot */}
      <div className="relative flex items-center justify-center">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
        <span className="absolute w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-75" />
      </div>

      <div className="flex items-center gap-1">
        <span
          className={`text-xs font-body ${darkMode ? "text-gray-400" : "text-gray-500"}`}
        >
          You're visitor
        </span>
        <span
          className={`text-xs font-heading font-bold ${darkMode ? "text-saffron" : "text-saffron-dark"}`}
        >
          #
        </span>
        <div className="flex">
          {isInView &&
            digits.map((d, i) => (
              <DigitRoller
                key={i}
                digit={d}
                delay={i * 0.15}
                darkMode={darkMode}
              />
            ))}
        </div>
      </div>

      {/* Subtle sparkle */}
      <motion.span
        animate={{ rotate: [0, 20, -10, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="text-sm"
      >
        ✨
      </motion.span>
    </motion.div>
  );
};

export default VisitorCounter;
