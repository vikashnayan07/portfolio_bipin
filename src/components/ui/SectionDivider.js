import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

/**
 * SectionDivider — a decorative separator between sections.
 * Features a curved SVG wave + animated saffron accent that
 * shifts horizontally on scroll for a subtle parallax feel.
 *
 * @param {boolean} flip — mirror vertically. Default false
 */
const SectionDivider = ({ flip = false }) => {
  const { darkMode } = useTheme();
  const { scrollYProgress } = useScroll();
  const x = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);

  return (
    <div
      className={`relative w-full overflow-hidden select-none pointer-events-none ${
        flip ? "rotate-180" : ""
      }`}
      style={{ height: 20 }}
    >
      <motion.svg
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        className="absolute inset-0 w-[110%] h-full"
        style={{ x }}
      >
        <path
          d="M0,30 C360,60 720,0 1080,30 C1260,45 1380,20 1440,30 L1440,60 L0,60 Z"
          fill={darkMode ? "#0A192F" : "#f8fafc"}
        />
        <path
          d="M0,35 C360,55 720,10 1080,35 C1260,48 1380,25 1440,35"
          fill="none"
          stroke="rgba(255,153,51,0.15)"
          strokeWidth="1.5"
        />
      </motion.svg>
    </div>
  );
};

export default SectionDivider;
