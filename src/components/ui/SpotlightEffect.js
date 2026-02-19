import React, { useState, useCallback } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

/**
 * SpotlightEffect — A cursor-following flashlight/torch that "illuminates"
 * the section it wraps. Only active in dark mode for maximum effect.
 *
 * Usage: Wrap any section content with <SpotlightEffect>...</SpotlightEffect>
 */

const SpotlightEffect = ({
  children,
  radius = 350,
  intensity = 0.12,
  color = "255, 153, 51", // saffron RGB
  className = "",
}) => {
  const { darkMode } = useTheme();
  const [isHovering, setIsHovering] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 300, damping: 30, mass: 0.5 });
  const springY = useSpring(mouseY, { stiffness: 300, damping: 30, mass: 0.5 });

  const handleMouseMove = useCallback(
    (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    },
    [mouseX, mouseY],
  );

  // Only show on dark mode for dramatic effect
  if (!darkMode) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {children}

      {/* Spotlight gradient overlay */}
      <motion.div
        className="absolute inset-0 z-[5] pointer-events-none transition-opacity duration-500"
        style={{
          opacity: isHovering ? 1 : 0,
          background: `radial-gradient(
            ${radius}px circle at var(--spotlight-x) var(--spotlight-y),
            rgba(${color}, ${intensity}) 0%,
            rgba(${color}, ${intensity * 0.4}) 30%,
            transparent 70%
          )`,
          "--spotlight-x": springX,
          "--spotlight-y": springY,
        }}
      />

      {/* CSS variable bridge for the radial gradient */}
      <motion.div
        className="absolute inset-0 z-[5] pointer-events-none"
        style={{
          opacity: isHovering ? 1 : 0,
          transition: "opacity 0.5s ease",
          background: "transparent",
        }}
      >
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: radius * 2,
            height: radius * 2,
            x: springX,
            y: springY,
            translateX: "-50%",
            translateY: "-50%",
            background: `radial-gradient(
              circle,
              rgba(${color}, ${intensity}) 0%,
              rgba(${color}, ${intensity * 0.3}) 40%,
              transparent 70%
            )`,
            filter: "blur(2px)",
          }}
        />
      </motion.div>
    </div>
  );
};

export default SpotlightEffect;
