import React, { useRef, useEffect, useState, useCallback } from "react";
import { motion, useInView } from "framer-motion";

/* ═══════════════════════════════════════════
   ANIMATED COUNTER — Scroll-triggered count-up
   
   Props:
     end        — target number (e.g. 500)
     suffix     — text after number (e.g. "+", "%")
     prefix     — text before number (e.g. "₹", "#")
     label      — description under the number
     duration   — count-up duration in ms (default 2000)
     icon       — optional React icon element
     className  — extra container classes
     once       — animate only first time in view (default true)
═══════════════════════════════════════════ */
const AnimatedCounter = ({
  end = 0,
  suffix = "",
  prefix = "",
  label = "",
  duration = 2000,
  icon = null,
  className = "",
  once = true,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: "-80px" });
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  const animate = useCallback(() => {
    if (hasAnimated && once) return;

    const startTime = performance.now();
    const startValue = 0;

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutExpo curve for satisfying deceleration
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentValue = Math.floor(startValue + (end - startValue) * eased);

      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setCount(end);
        setHasAnimated(true);
      }
    };

    requestAnimationFrame(step);
  }, [end, duration, hasAnimated, once]);

  useEffect(() => {
    if (isInView) {
      animate();
    } else if (!once) {
      setCount(0);
      setHasAnimated(false);
    }
  }, [isInView, animate, once]);

  return (
    <motion.div
      ref={ref}
      className={`flex flex-col items-center text-center ${className}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Optional icon */}
      {icon && (
        <motion.div
          className="mb-2 text-saffron"
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 15,
            delay: 0.1,
          }}
        >
          {icon}
        </motion.div>
      )}

      {/* Counter number */}
      <div className="relative">
        <span className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold tabular-nums">
          <span className="opacity-80">{prefix}</span>
          <span className="gradient-text">{count.toLocaleString()}</span>
          <span className="text-saffron">{suffix}</span>
        </span>

        {/* Glow effect behind number */}
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-lg"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(255,153,51,0.12) 0%, transparent 70%)",
            filter: "blur(15px)",
          }}
          animate={isInView ? { opacity: [0, 0.6, 0.3] } : { opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </div>

      {/* Label */}
      {label && (
        <p className="mt-1.5 text-xs sm:text-sm font-body font-medium tracking-wide text-gray-400 uppercase">
          {label}
        </p>
      )}
    </motion.div>
  );
};

export default AnimatedCounter;
