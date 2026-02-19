import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/**
 * ParallaxSection — wraps children in a parallax container.
 * Content moves at a different rate from scroll, creating depth.
 *
 * @param {number} speed  — parallax strength. Positive = slower (background feel),
 *                          negative = faster (foreground feel). Default 0.3
 * @param {string} className — optional extra classes
 */
const ParallaxSection = ({ children, speed = 0.3, className = "" }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [speed * -100, speed * 100]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
};

export default ParallaxSection;
