import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

/**
 * SectionTransition — Wraps each section with smooth FLIP-style
 * entrance animations triggered on scroll. Provides a morph/reveal
 * effect as sections come into the viewport.
 *
 * Props:
 *  - variant: "slide-up" | "scale-fade" | "clip-reveal" | "rotate-in"
 *  - delay: additional delay in seconds
 *  - once: trigger only once (default true)
 */

const variants = {
  "slide-up": {
    hidden: { opacity: 0, y: 80, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  },
  "scale-fade": {
    hidden: { opacity: 0, scale: 0.92, filter: "blur(6px)" },
    visible: {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
    },
  },
  "clip-reveal": {
    hidden: {
      opacity: 0,
      clipPath: "inset(10% 10% 10% 10%)",
    },
    visible: {
      opacity: 1,
      clipPath: "inset(0% 0% 0% 0%)",
      transition: { duration: 1, ease: [0.16, 1, 0.3, 1] },
    },
  },
  "rotate-in": {
    hidden: { opacity: 0, rotateX: 8, y: 60, perspective: 1200 },
    visible: {
      opacity: 1,
      rotateX: 0,
      y: 0,
      transition: { duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  },
};

const SectionTransition = ({
  children,
  variant = "slide-up",
  delay = 0,
  once = true,
  className = "",
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once,
    margin: "-80px 0px",
  });

  const chosenVariant = variants[variant] || variants["slide-up"];

  // Apply delay
  const adjustedVariant = {
    hidden: chosenVariant.hidden,
    visible: {
      ...chosenVariant.visible,
      transition: {
        ...chosenVariant.visible.transition,
        delay,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={adjustedVariant}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
      style={{ willChange: "transform, opacity, filter" }}
    >
      {children}
    </motion.div>
  );
};

export default SectionTransition;
