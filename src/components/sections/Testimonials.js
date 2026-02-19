import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import {
  FaQuoteLeft,
  FaChevronLeft,
  FaChevronRight,
  FaPlay,
} from "react-icons/fa";

/**
 * Testimonials — Carousel with circular video-style thumbnails.
 * Thumbnails have a play-overlay that shows animated GIF-like effect on hover.
 */

const testimonials = [
  {
    id: 1,
    name: "Ravi Shankar",
    role: "Fellow BPSC Aspirant",
    quote:
      "Bipin's dedication is extraordinary. His study group sessions helped me crack GS Paper-I. Truly a born leader and collaborator.",
    avatar: "RS",
    avatarGradient: "from-saffron to-gold",
    rating: 5,
    videoThumb: true,
  },
  {
    id: 2,
    name: "Dr. Priya Kumari",
    role: "B.Ed Professor",
    quote:
      "One of the most committed students I've seen. Bipin's lesson plans are creative, well-researched, and truly student-centric.",
    avatar: "PK",
    avatarGradient: "from-emerald-400 to-teal-400",
    rating: 5,
    videoThumb: false,
  },
  {
    id: 3,
    name: "Amit Kumar Yadav",
    role: "Study Group Member",
    quote:
      "His current affairs notes are gold! The way he breaks down complex topics into simple points is remarkable. Thanks, Bipin bhai!",
    avatar: "AY",
    avatarGradient: "from-blue-400 to-cyan-400",
    rating: 5,
    videoThumb: true,
  },
  {
    id: 4,
    name: "Sunita Devi",
    role: "School Teacher (Mentor)",
    quote:
      "I've mentored many aspiring teachers, but Bipin's passion for rural education in Bihar is unique. He will make a real difference.",
    avatar: "SD",
    avatarGradient: "from-rose-400 to-pink-400",
    rating: 5,
    videoThumb: false,
  },
  {
    id: 5,
    name: "Vikash Ranjan",
    role: "Childhood Friend",
    quote:
      "From our school days to BPSC preparation — Bipin has always been the one pushing everyone to aim higher. A true inspiration.",
    avatar: "VR",
    avatarGradient: "from-violet-400 to-purple-400",
    rating: 4,
    videoThumb: true,
  },
];

/* ─── Star Rating ─── */
const StarRating = ({ rating, darkMode }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <svg
        key={star}
        className={`w-3.5 h-3.5 ${star <= rating ? "text-saffron" : darkMode ? "text-gray-600" : "text-gray-300"}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

/* ─── Avatar Thumbnail ─── */
const AvatarThumb = ({ testimonial, isActive, darkMode, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.95 }}
      className={`relative w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden flex-shrink-0
        transition-all duration-300 ${
          isActive
            ? "ring-2 ring-saffron ring-offset-2 ring-offset-navy"
            : "opacity-60 hover:opacity-100"
        }`}
    >
      {/* Avatar */}
      <div
        className={`w-full h-full bg-gradient-to-br ${testimonial.avatarGradient}
        flex items-center justify-center`}
      >
        <span className="text-sm md:text-base font-heading font-bold text-white">
          {testimonial.avatar}
        </span>
      </div>

      {/* Video play overlay (for video thumbnails) */}
      {testimonial.videoThumb && (
        <AnimatePresence>
          {(isHovered || isActive) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/30 flex items-center justify-center"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <FaPlay className="text-white text-xs" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Animated ring for video thumbs */}
      {testimonial.videoThumb && isActive && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-saffron/50"
          animate={{ scale: [1, 1.3], opacity: [0.8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </motion.button>
  );
};

/* ─── Main Testimonials Section ─── */
const Testimonials = ({ className = "" }) => {
  const { darkMode } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const intervalRef = useRef(null);

  const next = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  }, []);

  const prev = useCallback(() => {
    setActiveIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length,
    );
  }, []);

  // Auto-advance
  useEffect(() => {
    intervalRef.current = setInterval(next, 6000);
    return () => clearInterval(intervalRef.current);
  }, [next]);

  // Reset timer on manual navigation
  const goTo = useCallback((index) => {
    setActiveIndex(index);
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
  }, []);

  const active = testimonials[activeIndex];

  return (
    <section
      id="testimonials"
      className={`section-padding relative overflow-hidden ${className}`}
    >
      <div ref={sectionRef} className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2
            className={`text-3xl md:text-5xl font-heading font-bold mb-4 ${darkMode ? "text-white" : "text-navy"}`}
          >
            What People <span className="gradient-text">Say</span>
          </h2>
          <p
            className={`text-base font-body max-w-lg mx-auto ${darkMode ? "text-gray-400" : "text-gray-500"}`}
          >
            Words from mentors, peers, and fellow aspirants who've been part of
            my journey.
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-saffron to-saffron-light mx-auto rounded-full mt-4" />
        </motion.div>

        {/* Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Quote Card */}
          <div
            className={`relative rounded-3xl p-8 md:p-12 mb-8
            ${darkMode ? "glass" : "glass-light"}`}
          >
            {/* Quote icon */}
            <FaQuoteLeft
              className={`text-3xl mb-6 ${darkMode ? "text-saffron/30" : "text-saffron/20"}`}
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <p
                  className={`text-lg md:text-xl font-body leading-relaxed mb-6
                  ${darkMode ? "text-gray-200" : "text-gray-700"}`}
                >
                  "{active.quote}"
                </p>

                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${active.avatarGradient}
                    flex items-center justify-center flex-shrink-0`}
                  >
                    <span className="text-sm font-heading font-bold text-white">
                      {active.avatar}
                    </span>
                  </div>
                  <div>
                    <h4
                      className={`text-base font-heading font-bold ${darkMode ? "text-white" : "text-navy"}`}
                    >
                      {active.name}
                    </h4>
                    <p
                      className={`text-xs font-body ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                      {active.role}
                    </p>
                    <StarRating rating={active.rating} darkMode={darkMode} />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation arrows */}
            <div className="absolute top-1/2 -translate-y-1/2 left-2 md:-left-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  prev();
                  goTo(
                    (activeIndex - 1 + testimonials.length) %
                      testimonials.length,
                  );
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center
                  ${
                    darkMode
                      ? "bg-navy-lighter/80 text-saffron border border-saffron/20 hover:border-saffron/50"
                      : "bg-white text-saffron-dark border border-saffron/20 hover:border-saffron shadow-md"
                  }`}
              >
                <FaChevronLeft className="text-sm" />
              </motion.button>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 right-2 md:-right-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  next();
                  goTo((activeIndex + 1) % testimonials.length);
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center
                  ${
                    darkMode
                      ? "bg-navy-lighter/80 text-saffron border border-saffron/20 hover:border-saffron/50"
                      : "bg-white text-saffron-dark border border-saffron/20 hover:border-saffron shadow-md"
                  }`}
              >
                <FaChevronRight className="text-sm" />
              </motion.button>
            </div>
          </div>

          {/* Avatar Thumbnails */}
          <div className="flex items-center justify-center gap-4">
            {testimonials.map((t, i) => (
              <AvatarThumb
                key={t.id}
                testimonial={t}
                isActive={i === activeIndex}
                darkMode={darkMode}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
