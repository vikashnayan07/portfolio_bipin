import React from "react";
import { motion } from "framer-motion";

/**
 * TextReveal — Splits text into words and reveals each word sequentially
 * with a staggered slide-up + fade animation on scroll.
 *
 * @param {string}  text      — the text string to animate
 * @param {string}  className — optional styling on the container
 * @param {number}  stagger   — delay between each word (s). Default 0.04
 * @param {string}  as        — wrapper element tag. Default 'p'
 */
const TextReveal = ({
  text,
  className = "",
  stagger = 0.04,
  as: Tag = "p",
}) => {
  const words = text.split(" ");

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
      },
    },
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
    >
      <Tag className="inline">
        {words.map((word, i) => (
          <motion.span
            key={`${word}-${i}`}
            variants={wordVariants}
            className="inline-block mr-[0.3em]"
          >
            {word}
          </motion.span>
        ))}
      </Tag>
    </motion.div>
  );
};

export default TextReveal;
