import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

const SectionWrapper = ({ children, id, className = "" }) => {
  const { darkMode } = useTheme();

  return (
    <section id={id} className={`relative section-padding ${className}`}>
      {/* Subtle background pattern */}
      <div
        className={`absolute inset-0 opacity-5 ${
          darkMode ? "block" : "hidden"
        }`}
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0, 191, 255, 0.3) 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />
      <div className="relative z-10">{children}</div>
    </section>
  );
};

export default SectionWrapper;
