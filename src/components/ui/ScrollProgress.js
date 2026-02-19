import React from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

/**
 * ScrollProgress — fixed top progress bar showing page scroll position.
 * Sits below the navbar (top-0) as a thin gradient line.
 */
const ScrollProgress = () => {
  const { darkMode } = useTheme();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[60] h-[3px] origin-left"
      style={{
        scaleX,
        background: darkMode
          ? "linear-gradient(90deg, #FF9933, #FFD700, #F4A261)"
          : "linear-gradient(90deg, #E88A1A, #FF9933, #F4A261)",
      }}
    />
  );
};

export default ScrollProgress;
