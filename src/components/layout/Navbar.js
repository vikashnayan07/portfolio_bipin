import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import { HiMenu, HiX } from "react-icons/hi";
import { BsSun, BsMoon } from "react-icons/bs";
import MagneticButton from "../ui/MagneticButton";

const navLinks = [
  { name: "Home", href: "#hero" },
  { name: "About", href: "#about" },
  { name: "Projects", href: "#projects" },
  { name: "Skills", href: "#skills" },
  { name: "Blog", href: "#blog" },
  { name: "Contact", href: "#contact" },
];

const Navbar = () => {
  const { darkMode, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* Track active section via IntersectionObserver */
  useEffect(() => {
    const ids = navLinks.map((l) => l.href.replace("#", ""));
    const observers = [];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { rootMargin: "-40% 0px -55% 0px" },
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const navVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const linkVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4 },
    }),
  };

  const mobileMenuVariants = {
    closed: {
      x: "100%",
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    open: {
      x: 0,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  };

  return (
    <motion.nav
      variants={navVariants}
      initial="hidden"
      animate="visible"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? darkMode
            ? "glass shadow-lg shadow-black/20"
            : "glass-light shadow-lg shadow-gray-200/50"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.a
            href="#hero"
            className="relative z-10"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center gap-2.5">
              {/* Logo Mark — Hexagonal BK Monogram */}
              <div className="relative w-9 h-9 flex items-center justify-center">
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 36 36"
                  fill="none"
                >
                  <defs>
                    <linearGradient
                      id="bk-logo-grad"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#FF9933" />
                      <stop offset="100%" stopColor="#FFD700" />
                    </linearGradient>
                  </defs>
                  <polygon
                    points="18,2 33,10 33,26 18,34 3,26 3,10"
                    stroke="url(#bk-logo-grad)"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                    fill="url(#bk-logo-grad)"
                    fillOpacity="0.08"
                  />
                  <polygon
                    points="18,6 29,12 29,24 18,30 7,24 7,12"
                    stroke="url(#bk-logo-grad)"
                    strokeWidth="0.5"
                    strokeLinejoin="round"
                    fill="none"
                    opacity="0.3"
                  />
                </svg>
                <span className="text-xs font-heading font-black bg-gradient-to-br from-saffron to-gold bg-clip-text text-transparent relative z-10 tracking-tight">
                  BK
                </span>
              </div>
              {/* Logotype */}
              <div className="flex flex-col leading-none">
                <span className="text-base font-heading font-extrabold gradient-text tracking-tight">
                  Bipin
                </span>
                <span className="text-[10px] font-body font-medium tracking-[0.2em] uppercase text-saffron/70">
                  Kumar
                </span>
              </div>
            </div>
          </motion.a>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link, i) => (
              <motion.a
                key={link.name}
                href={link.href}
                custom={i}
                variants={linkVariants}
                initial="hidden"
                animate="visible"
                className={`relative font-body text-sm font-medium tracking-wide
                  ${
                    activeSection === link.href.replace("#", "")
                      ? "text-saffron"
                      : darkMode
                        ? "text-gray-300 hover:text-saffron"
                        : "text-gray-600 hover:text-saffron-dark"
                  }
                  transition-colors duration-300 group`}
              >
                {link.name}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-saffron to-saffron-light
                  transition-all duration-300 ${
                    activeSection === link.href.replace("#", "")
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                  }`}
                />
              </motion.a>
            ))}

            {/* Theme Toggle */}
            <motion.button
              onClick={toggleTheme}
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
              className={`p-2 rounded-full transition-all duration-300 ${
                darkMode
                  ? "text-yellow-400 hover:bg-navy-lighter"
                  : "text-violet hover:bg-gray-200"
              }`}
              aria-label="Toggle theme"
            >
              {darkMode ? <BsSun size={20} /> : <BsMoon size={20} />}
            </motion.button>

            {/* CTA Button */}
            <MagneticButton strength={8}>
              <motion.a
                href="#contact"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary text-sm"
              >
                Let's Talk
              </motion.a>
            </MagneticButton>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center space-x-4">
            <motion.button
              onClick={toggleTheme}
              whileTap={{ scale: 0.9 }}
              className={`p-2 rounded-full ${
                darkMode ? "text-yellow-400" : "text-violet"
              }`}
              aria-label="Toggle theme"
            >
              {darkMode ? <BsSun size={18} /> : <BsMoon size={18} />}
            </motion.button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 z-50 relative ${
                darkMode ? "text-white" : "text-navy"
              }`}
              aria-label="Toggle menu"
            >
              {isOpen ? <HiX size={28} /> : <HiMenu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className={`fixed top-0 right-0 h-screen w-3/4 z-40 ${
              darkMode ? "glass" : "glass-light"
            } flex flex-col items-center justify-center space-y-8`}
          >
            {navLinks.map((link, i) => (
              <motion.a
                key={link.name}
                href={link.href}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setIsOpen(false)}
                className={`text-xl font-heading font-semibold ${
                  darkMode
                    ? "text-white hover:text-saffron"
                    : "text-navy hover:text-saffron-dark"
                } transition-colors duration-300`}
              >
                {link.name}
              </motion.a>
            ))}
            <motion.a
              href="#contact"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              onClick={() => setIsOpen(false)}
              className="btn-primary"
            >
              Let's Talk
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
