import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Loader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 400);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {progress < 100 && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 bg-navy z-[9999] flex flex-col items-center justify-center"
        >
          {/* Animated Orb */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              boxShadow: [
                "0 0 20px #FF9933, 0 0 40px #FF9933",
                "0 0 40px #F4A261, 0 0 80px #F4A261",
                "0 0 20px #FF9933, 0 0 40px #FF9933",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-saffron to-saffron-light mb-8"
          />

          {/* Logo */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-heading font-bold gradient-text mb-6"
          >
            {"Bipin Kumar"}
          </motion.h1>

          {/* Progress Bar */}
          <div className="w-48 h-1 bg-navy-lighter rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-saffron to-saffron-light rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>

          {/* Percentage */}
          <motion.p className="text-saffron text-sm font-body mt-3 tracking-widest">
            {Math.round(progress)}%
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Loader;
