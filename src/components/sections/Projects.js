import React, { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import { supabase } from "../../lib/supabase";
import {
  FaBook,
  FaLandmark,
  FaUsers,
  FaChalkboardTeacher,
  FaExternalLinkAlt,
  FaArrowRight,
} from "react-icons/fa";
import { HiAcademicCap } from "react-icons/hi";

/* ─── Gradient palette assigned by index ─── */
const gradientPalette = [
  "from-saffron to-saffron-light",
  "from-amber-500 to-orange-400",
  "from-emerald-500 to-teal-400",
  "from-blue-500 to-cyan-400",
  "from-purple-500 to-pink-400",
  "from-rose-500 to-red-400",
];

const categories = [
  { key: "all", label: "All", icon: <HiAcademicCap /> },
  { key: "study", label: "Study Materials", icon: <FaBook /> },
  { key: "research", label: "Research", icon: <FaLandmark /> },
  { key: "education", label: "Education", icon: <FaChalkboardTeacher /> },
  { key: "community", label: "Community", icon: <FaUsers /> },
];

/* ─── Project Card Component ─── */
const ProjectCard = ({ project, index }) => {
  const { darkMode } = useTheme();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [isHovered, setIsHovered] = useState(false);

  /* Normalize fields — works for both hardcoded & Supabase projects */
  const color =
    project.color || gradientPalette[index % gradientPalette.length];
  const tags = project.tags || project.tech_stack || [];
  const link = project.link || project.live_url || project.github_url || "#";
  const metrics = project.metrics || (project.is_featured ? "⭐ Featured" : "");
  const icon = project.icon || <FaBook className="text-2xl" />;
  const category = project.category || "study";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
      layout
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative"
    >
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`relative h-full rounded-2xl overflow-hidden transition-all duration-500 ${
          darkMode
            ? "glass hover:border-saffron/30"
            : "glass-light hover:border-saffron/40"
        }`}
      >
        {/* Top gradient bar */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${color}`} />

        {/* Cover image (if from Supabase) */}
        {project.image_url && (
          <div className="h-36 overflow-hidden">
            <img
              src={project.image_url}
              alt={project.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              decoding="async"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-4 md:p-6">
          {/* Icon + Category */}
          <div className="flex items-center justify-between mb-4">
            <motion.div
              animate={isHovered ? { rotate: [0, -10, 10, 0], scale: 1.1 } : {}}
              transition={{ duration: 0.5 }}
              className={`w-12 h-12 rounded-xl flex items-center justify-center
                bg-gradient-to-r ${color} text-white shadow-lg`}
            >
              {icon}
            </motion.div>
            <span
              className={`text-xs font-heading font-semibold uppercase tracking-wider px-3 py-1 rounded-full ${
                darkMode
                  ? "bg-saffron/10 text-saffron-light"
                  : "bg-saffron/10 text-saffron-dark"
              }`}
            >
              {category}
            </span>
          </div>

          {/* Title */}
          <h3
            className={`text-lg font-heading font-bold mb-2 transition-colors duration-300 ${
              darkMode
                ? "text-white group-hover:text-saffron"
                : "text-navy group-hover:text-saffron-dark"
            }`}
          >
            {project.title}
          </h3>

          {/* Description */}
          <p
            className={`text-sm font-body leading-relaxed mb-4 line-clamp-3 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {project.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag, i) => (
              <span
                key={i}
                className={`text-xs font-body px-2.5 py-1 rounded-full ${
                  darkMode
                    ? "bg-navy-lighter text-gray-300 border border-gray-700"
                    : "bg-gray-100 text-gray-600 border border-gray-200"
                }`}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Metrics */}
          {metrics && (
            <p
              className={`text-xs font-heading font-medium tracking-wide mb-4 ${
                darkMode ? "text-saffron/70" : "text-saffron-dark/70"
              }`}
            >
              📊 {metrics}
            </p>
          )}

          {/* Action */}
          <motion.a
            href={link}
            target={link.startsWith("http") ? "_blank" : undefined}
            rel={link.startsWith("http") ? "noopener noreferrer" : undefined}
            whileHover={{ x: 5 }}
            className={`inline-flex items-center gap-2 text-sm font-heading font-semibold
              transition-colors duration-300 ${
                darkMode
                  ? "text-saffron hover:text-saffron-light"
                  : "text-saffron-dark hover:text-saffron"
              }`}
          >
            View Details
            <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
          </motion.a>
        </div>

        {/* Hover glow effect */}
        <motion.div
          className={`absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-500 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background: `radial-gradient(circle at 50% 0%, rgba(255, 153, 51, 0.06) 0%, transparent 70%)`,
          }}
        />
      </motion.div>
    </motion.div>
  );
};

/* ─── Main Projects Section ─── */
const Projects = () => {
  const { darkMode } = useTheme();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [activeFilter, setActiveFilter] = useState("all");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  /* Fetch projects from Supabase on mount */
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("is_deleted", false)
          .order("sort_order", { ascending: true });
        if (!error && data) {
          setProjects(data);
        }
      } catch {
        // Network error — projects stays empty
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const filteredProjects =
    activeFilter === "all"
      ? projects
      : projects.filter((p) => (p.category || "study") === activeFilter);

  return (
    <section id="projects" className="section-padding relative">
      {/* Subtle background pattern */}
      <div
        className={`absolute inset-0 opacity-[0.03] ${darkMode ? "block" : "hidden"}`}
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255, 153, 51, 0.4) 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      <div ref={sectionRef} className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-16"
        >
          <h2
            className={`text-3xl md:text-5xl font-heading font-bold mb-4 ${
              darkMode ? "text-white" : "text-navy"
            }`}
          >
            My <span className="gradient-text">Projects</span> & Work
          </h2>
          <p
            className={`text-base md:text-lg font-body max-w-2xl mx-auto mb-6 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            A collection of study materials, research work, teaching resources,
            and community initiatives that define my academic journey.
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-saffron to-saffron-light mx-auto rounded-full" />
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8 md:mb-12"
        >
          {categories.map((cat) => (
            <motion.button
              key={cat.key}
              onClick={() => setActiveFilter(cat.key)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-heading
                font-medium transition-all duration-300 ${
                  activeFilter === cat.key
                    ? "bg-gradient-to-r from-saffron to-saffron-light text-white shadow-lg shadow-saffron/20"
                    : darkMode
                      ? "glass text-gray-300 hover:text-saffron hover:border-saffron/30"
                      : "glass-light text-gray-600 hover:text-saffron-dark hover:border-saffron/30"
                }`}
            >
              {cat.icon}
              {cat.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Project Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-64 rounded-2xl animate-pulse ${
                  darkMode ? "bg-white/5" : "bg-gray-100"
                }`}
              />
            ))}
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Empty state */}
        {filteredProjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p
              className={`text-lg font-body ${darkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              No projects in this category yet. Check back soon!
            </p>
          </motion.div>
        )}

        {/* View More CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-12"
        >
          <motion.a
            href="#contact"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-heading
              font-semibold text-base border-2 border-saffron/40 text-saffron
              hover:bg-saffron/10 hover:border-saffron transition-all duration-300"
          >
            Want to Know More?
            <FaExternalLinkAlt className="text-xs" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};

export default Projects;
