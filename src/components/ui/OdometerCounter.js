import React, { useRef, useEffect, useState } from "react";
import { motion, useInView, animate } from "framer-motion";

/**
 * OdometerCounter — Numbers roll up like a car odometer on scroll-into-view.
 * Supports suffix (e.g., "+"), prefix, and custom formatting.
 */

const OdometerCounter = ({
  value = 500,
  suffix = "+",
  prefix = "",
  duration = 2,
  className = "",
  digitClassName = "",
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const controls = animate(0, value, {
      duration,
      ease: [0.25, 0.46, 0.45, 0.94],
      onUpdate: (v) => setDisplayValue(Math.round(v)),
    });

    return () => controls.stop();
  }, [isInView, value, duration]);

  const digits = String(displayValue).split("");

  return (
    <span ref={ref} className={`inline-flex items-baseline ${className}`}>
      {prefix && <span className={digitClassName}>{prefix}</span>}
      <span className="inline-flex overflow-hidden">
        {digits.map((d, i) => (
          <motion.span
            key={`${i}-${d}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.2, delay: i * 0.02 }}
            className={`inline-block tabular-nums ${digitClassName}`}
            style={{ minWidth: "0.6em", textAlign: "center" }}
          >
            {d}
          </motion.span>
        ))}
      </span>
      {suffix && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: duration * 0.8 }}
          className={digitClassName}
        >
          {suffix}
        </motion.span>
      )}
    </span>
  );
};

export default OdometerCounter;
