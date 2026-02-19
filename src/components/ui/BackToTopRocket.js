import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

/**
 * BackToTopRocket — a floating "back to top" button that appears after
 * scrolling 40% of the page. Shows a small progress ring around it.
 */
const BackToTopRocket = () => {
  const { darkMode } = useTheme();
  const { scrollYProgress } = useScroll();
  const [show, setShow] = useState(false);

  // Drive the circular progress ring
  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (v) => {
      setShow(v > 0.15);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <motion.button
      onClick={scrollToTop}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={show ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
      whileHover={{ scale: 1.15, y: -3 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full
        flex items-center justify-center shadow-lg
        transition-colors duration-300 ${
          darkMode
            ? "bg-navy-lighter/90 border border-saffron/30 text-saffron hover:shadow-neon-saffron"
            : "bg-white/90 border border-saffron/40 text-saffron-dark hover:shadow-lg"
        } backdrop-blur-md`}
      aria-label="Back to top"
      style={{ pointerEvents: show ? "auto" : "none" }}
    >
      {/* Progress ring */}
      <svg
        className="absolute inset-0 w-full h-full -rotate-90"
        viewBox="0 0 48 48"
      >
        <circle
          cx="24"
          cy="24"
          r="22"
          fill="none"
          stroke={darkMode ? "rgba(255,153,51,0.1)" : "rgba(255,153,51,0.15)"}
          strokeWidth="2"
        />
        <motion.circle
          cx="24"
          cy="24"
          r="22"
          fill="none"
          stroke="#FF9933"
          strokeWidth="2"
          strokeLinecap="round"
          style={{ pathLength }}
        />
      </svg>

      {/* Arrow icon */}
      <svg
        viewBox="0 0 24 24"
        className="w-5 h-5 relative z-10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </motion.button>
  );
};

export default BackToTopRocket;
