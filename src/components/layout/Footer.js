import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import {
  FaGithub,
  FaLinkedinIn,
  FaTwitter,
  FaInstagram,
  FaEnvelope,
  FaHeart,
} from "react-icons/fa";

const socialLinks = [
  {
    icon: <FaGithub />,
    href: "https://github.com/bipinkumar",
    label: "GitHub",
  },
  {
    icon: <FaLinkedinIn />,
    href: "https://linkedin.com/in/bipinkumar",
    label: "LinkedIn",
  },
  {
    icon: <FaTwitter />,
    href: "https://twitter.com/bipinkumar",
    label: "Twitter",
  },
  {
    icon: <FaInstagram />,
    href: "https://instagram.com/bipinkumar",
    label: "Instagram",
  },
  { icon: <FaEnvelope />, href: "mailto:bipin@example.com", label: "Email" },
];

const Footer = () => {
  const { darkMode } = useTheme();

  return (
    <footer
      className={`relative py-12 px-6 md:px-12 lg:px-24 ${
        darkMode
          ? "bg-navy border-t border-saffron/10"
          : "bg-gray-50 border-t border-gray-200"
      }`}
    >
      <div className="max-w-6xl mx-auto">
        {/* Top section */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8">
          {/* Logo */}
          <motion.a
            href="#hero"
            whileHover={{ scale: 1.05 }}
            className="text-2xl font-heading font-bold gradient-text mb-4 md:mb-0"
          >
            {"Bipin Kumar"}
          </motion.a>

          {/* Social Icons */}
          <div className="flex items-center space-x-4">
            {socialLinks.map((link, i) => (
              <motion.a
                key={i}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2, y: -3 }}
                whileTap={{ scale: 0.9 }}
                className={`w-10 h-10 rounded-full flex items-center justify-center
                  text-lg transition-all duration-300 ${
                    darkMode
                      ? "glass text-gray-300 hover:text-saffron hover:shadow-neon-saffron"
                      : "glass-light text-gray-500 hover:text-saffron-dark hover:shadow-lg"
                  }`}
                aria-label={link.label}
              >
                {link.icon}
              </motion.a>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div
          className={`w-full h-px mb-8 ${
            darkMode
              ? "bg-gradient-to-r from-transparent via-saffron/30 to-transparent"
              : "bg-gradient-to-r from-transparent via-gray-300 to-transparent"
          }`}
        />

        {/* Bottom section */}
        <div className="flex flex-col md:flex-row items-center justify-between text-sm">
          <p
            className={`font-body flex items-center gap-1 mb-4 md:mb-0 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            &copy; {new Date().getFullYear()} Bipin Kumar. Built with
            <FaHeart className="text-red-500 inline mx-1" />& React
          </p>

          <div className="flex items-center space-x-6">
            <a
              href="#hero"
              className={`font-body transition-colors duration-300 ${
                darkMode
                  ? "text-gray-400 hover:text-saffron"
                  : "text-gray-500 hover:text-saffron-dark"
              }`}
            >
              Privacy
            </a>
            <a
              href="#hero"
              className={`font-body transition-colors duration-300 ${
                darkMode
                  ? "text-gray-400 hover:text-saffron"
                  : "text-gray-500 hover:text-saffron-dark"
              }`}
            >
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
