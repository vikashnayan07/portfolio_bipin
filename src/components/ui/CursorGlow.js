import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

/**
 * CursorGlow — a soft radial glow that follows the mouse cursor.
 * Only renders on non-touch (pointer: fine) devices.
 */
const CursorGlow = () => {
  const { darkMode } = useTheme();
  const [visible, setVisible] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springX = useSpring(cursorX, { damping: 25, stiffness: 200 });
  const springY = useSpring(cursorY, { damping: 25, stiffness: 200 });

  useEffect(() => {
    // only show on devices with fine pointer (desktop)
    const mq = window.matchMedia("(pointer: fine)");
    if (!mq.matches) return;

    setVisible(true);

    const move = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [cursorX, cursorY]);

  if (!visible) return null;

  return (
    <motion.div
      className="fixed pointer-events-none z-[9999] mix-blend-screen"
      style={{
        left: springX,
        top: springY,
        width: 300,
        height: 300,
        x: -150,
        y: -150,
        borderRadius: "50%",
        background: darkMode
          ? "radial-gradient(circle, rgba(255,153,51,0.06) 0%, transparent 70%)"
          : "radial-gradient(circle, rgba(255,153,51,0.04) 0%, transparent 70%)",
      }}
    />
  );
};

export default CursorGlow;
