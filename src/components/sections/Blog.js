import React, { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { supabase } from "../../lib/supabase";
import TiltCard from "../ui/TiltCard";
import {
  FaCalendarAlt,
  FaClock,
  FaArrowRight,
  FaBookOpen,
  FaShareAlt,
  FaHeart,
  FaRegComment,
} from "react-icons/fa";
import { HiBookOpen } from "react-icons/hi";

/* ─── Helpers for Supabase posts ─── */
const gradientPalette = [
  "from-saffron to-saffron-light",
  "from-amber-500 to-yellow-400",
  "from-emerald-500 to-teal-400",
  "from-blue-500 to-cyan-400",
  "from-rose-500 to-pink-400",
  "from-violet-500 to-purple-400",
];
const emojiPalette = ["📚", "🏛️", "🎓", "📰", "✍️", "🤝", "💡", "📖"];

/** Normalise a Supabase blog_post row to the shape the UI cards expect */
const normalisePost = (post, index) => ({
  ...post,
  id: post.id,
  title: post.title,
  excerpt:
    post.excerpt ||
    (post.content
      ? post.content.replace(/<[^>]*>/g, "").slice(0, 160) + "…"
      : ""),
  category: (post.tags && post.tags[0]) || "General",
  date: post.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
  readTime: `${post.read_time || 5} min read`,
  icon: <FaBookOpen />,
  gradient: gradientPalette[index % gradientPalette.length],
  tags: post.tags || [],
  likes: post.views || 0,
  comments: 0,
  featured: index === 0,
  coverEmoji: emojiPalette[index % emojiPalette.length],
  coverImage: post.cover_image || "",
});

/* ─── Featured Post Card ─── */
const FeaturedPost = ({ post }) => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7 }}
      className="mb-8 md:mb-12"
    >
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 300 }}
        className={`relative rounded-3xl overflow-hidden ${
          darkMode ? "glass" : "glass-light"
        } group cursor-pointer`}
        onClick={() => navigate(`/blog/${post.slug}`)}
      >
        {/* Gradient Top Bar */}
        <div className={`h-1.5 bg-gradient-to-r ${post.gradient}`} />

        <div className="md:flex">
          {/* Left visual */}
          <div
            className={`md:w-2/5 p-5 md:p-8 flex items-center justify-center relative overflow-hidden
            ${darkMode ? "bg-navy-lighter/50" : "bg-gray-50"}`}
          >
            {/* Blurred background glow */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${post.gradient} opacity-10
              group-hover:opacity-20 transition-opacity duration-500`}
            />
            {post.coverImage ? (
              <img
                src={post.coverImage}
                alt={post.title}
                className="relative z-10 w-full h-full object-cover rounded-xl"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative z-10"
              >
                <span className="text-8xl md:text-9xl">{post.coverEmoji}</span>
              </motion.div>
            )}
            {/* Featured badge */}
            <div
              className="absolute top-4 left-4 px-3 py-1 rounded-full bg-gradient-to-r
              from-saffron to-saffron-light text-xs font-heading font-bold text-navy
              flex items-center gap-1"
            >
              <HiBookOpen className="text-sm" /> Featured
            </div>
          </div>

          {/* Right content */}
          <div className="md:w-3/5 p-4 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-heading font-semibold
                  bg-gradient-to-r ${post.gradient} text-white`}
                >
                  {post.category}
                </span>
                <span
                  className={`flex items-center gap-1 text-xs ${
                    darkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  <FaCalendarAlt className="text-[10px]" />
                  {new Date(post.date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              <h3
                className={`text-xl md:text-2xl font-heading font-bold mb-3 leading-tight
                group-hover:text-saffron transition-colors duration-300 ${
                  darkMode ? "text-white" : "text-navy"
                }`}
              >
                {post.title}
              </h3>

              <p
                className={`text-sm font-body leading-relaxed mb-4 ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {post.excerpt}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-heading ${
                      darkMode
                        ? "bg-white/5 text-gray-400 border border-white/5"
                        : "bg-gray-100 text-gray-500 border border-gray-200"
                    }`}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span
                  className={`flex items-center gap-1 text-xs ${
                    darkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  <FaClock className="text-[10px]" /> {post.readTime}
                </span>
                <span
                  className={`flex items-center gap-1 text-xs ${
                    darkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  <FaHeart className="text-[10px] text-rose-400" /> {post.likes}
                </span>
                <span
                  className={`flex items-center gap-1 text-xs ${
                    darkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  <FaRegComment className="text-[10px]" /> {post.comments}
                </span>
              </div>
              <motion.span
                whileHover={{ x: 4 }}
                className="flex items-center gap-1 text-saffron text-sm font-heading font-semibold cursor-pointer"
              >
                Read More <FaArrowRight className="text-xs" />
              </motion.span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.article>
  );
};

/* ─── Regular Blog Card ─── */
const BlogCard = ({ post, index }) => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <TiltCard maxTilt={10} scale={1.03} glareOpacity={0.1} className="h-full">
        <div
          className={`h-full rounded-2xl overflow-hidden cursor-pointer group ${
            darkMode ? "glass" : "glass-light"
          }`}
          onClick={() => navigate(`/blog/${post.slug}`)}
        >
          {/* Top Gradient Bar */}
          <div className={`h-1 bg-gradient-to-r ${post.gradient}`} />

          {/* Cover Area */}
          <div
            className={`h-36 flex items-center justify-center relative overflow-hidden
          ${darkMode ? "bg-navy-lighter/40" : "bg-gray-50"}`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${post.gradient} opacity-5
            group-hover:opacity-15 transition-opacity duration-500`}
            />
            {post.coverImage ? (
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover relative z-10"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <motion.span
                animate={{ y: [0, -6, 0] }}
                transition={{
                  duration: 3 + index * 0.3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="text-5xl relative z-10"
              >
                {post.coverEmoji}
              </motion.span>
            )}

            {/* Category badge */}
            <span
              className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px]
            font-heading font-semibold bg-gradient-to-r ${post.gradient} text-white`}
            >
              {post.category}
            </span>

            {/* Share button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center
              opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                darkMode
                  ? "bg-white/10 text-white"
                  : "bg-black/10 text-gray-700"
              }`}
            >
              <FaShareAlt className="text-xs" />
            </motion.button>
          </div>

          {/* Content */}
          <div className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <span
                className={`flex items-center gap-1 text-[10px] ${
                  darkMode ? "text-gray-500" : "text-gray-400"
                }`}
              >
                <FaCalendarAlt />
                {new Date(post.date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
              <span
                className={`flex items-center gap-1 text-[10px] ${
                  darkMode ? "text-gray-500" : "text-gray-400"
                }`}
              >
                <FaClock /> {post.readTime}
              </span>
            </div>

            <h3
              className={`text-base font-heading font-bold mb-2 leading-snug
            group-hover:text-saffron transition-colors duration-300 line-clamp-2 ${
              darkMode ? "text-white" : "text-navy"
            }`}
            >
              {post.title}
            </h3>

            <p
              className={`text-xs font-body leading-relaxed mb-3 line-clamp-3 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {post.excerpt}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {post.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-heading ${
                    darkMode
                      ? "bg-white/5 text-gray-400"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Bottom Stats */}
            <div
              className={`flex items-center justify-between pt-3 border-t ${
                darkMode ? "border-white/5" : "border-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex items-center gap-1 text-[10px] ${
                    darkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  <FaHeart className="text-rose-400" /> {post.likes}
                </span>
                <span
                  className={`flex items-center gap-1 text-[10px] ${
                    darkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  <FaRegComment /> {post.comments}
                </span>
              </div>
              <motion.span
                whileHover={{ x: 3 }}
                className="text-saffron text-xs font-heading font-semibold flex items-center gap-1"
              >
                Read <FaArrowRight className="text-[9px]" />
              </motion.span>
            </div>
          </div>
        </div>
      </TiltCard>
    </motion.article>
  );
};

/* ─── Main Blog Section ─── */
const Blog = () => {
  const { darkMode } = useTheme();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [activeCategory, setActiveCategory] = useState("All");
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  /* Fetch published blog posts from Supabase on mount */
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("is_published", true)
          .eq("is_deleted", false)
          .order("created_at", { ascending: false });
        if (!error && data) {
          setBlogPosts(data.map((p, i) => normalisePost(p, i)));
        }
      } catch {
        // Network error — blogPosts stays empty
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  /* Derive categories dynamically from posts */
  const categories = [
    "All",
    ...Array.from(new Set(blogPosts.map((p) => p.category).filter(Boolean))),
  ];

  const featuredPost = blogPosts.find((p) => p.featured);
  const regularPosts = blogPosts.filter((p) => {
    if (activeCategory === "All") return !p.featured;
    return !p.featured && p.category === activeCategory;
  });

  return (
    <section id="blog" className="section-padding relative overflow-hidden">
      {/* Background pattern */}
      <div
        className={`absolute inset-0 opacity-[0.015] ${darkMode ? "block" : "hidden"}`}
        style={{
          backgroundImage:
            "radial-gradient(circle at 2px 2px, rgba(255,153,51,0.4) 1px, transparent 0)",
          backgroundSize: "60px 60px",
        }}
      />

      <div ref={sectionRef} className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2
            className={`text-3xl md:text-5xl font-heading font-bold mb-4 ${
              darkMode ? "text-white" : "text-navy"
            }`}
          >
            Blog & <span className="gradient-text">Insights</span>
          </h2>
          <p
            className={`text-base md:text-lg font-body max-w-2xl mx-auto mb-6 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Thoughts, strategies, and reflections from my BPSC journey and B.Ed
            experience — written to help fellow aspirants across Bihar.
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-saffron to-saffron-light mx-auto rounded-full" />
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-2 mb-10"
        >
          {categories.map((cat) => (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-heading font-semibold
                transition-all duration-300 ${
                  activeCategory === cat
                    ? "bg-gradient-to-r from-saffron to-saffron-light text-navy shadow-neon-saffron"
                    : darkMode
                      ? "bg-white/5 text-gray-400 hover:bg-white/10 border border-white/5"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200"
                }`}
            >
              {cat}
            </motion.button>
          ))}
        </motion.div>

        {/* Featured Post */}
        {!loading && activeCategory === "All" && featuredPost && (
          <FeaturedPost post={featuredPost} />
        )}

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-72 rounded-2xl animate-pulse ${
                  darkMode ? "bg-white/5" : "bg-gray-100"
                }`}
              />
            ))}
          </div>
        ) : (
          <>
            {/* Regular Posts Grid */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
              >
                {regularPosts.map((post, index) => (
                  <BlogCard key={post.id} post={post} index={index} />
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Empty State */}
            {regularPosts.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <span className="text-5xl mb-4 block">📝</span>
                <p
                  className={`font-body ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                >
                  No posts yet in this category. Stay tuned!
                </p>
              </motion.div>
            )}
          </>
        )}

        {/* Newsletter CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-10 md:mt-16"
        >
          <div
            className={`rounded-2xl p-5 md:p-8 text-center relative overflow-hidden ${
              darkMode ? "glass" : "glass-light"
            }`}
          >
            {/* Decorative glow */}
            <div
              className="absolute -top-20 -right-20 w-60 h-60 rounded-full
              bg-saffron/5 blur-3xl pointer-events-none"
            />

            <span className="text-4xl block mb-3">📬</span>
            <h3
              className={`text-xl font-heading font-bold mb-2 ${
                darkMode ? "text-white" : "text-navy"
              }`}
            >
              Stay Updated
            </h3>
            <p
              className={`text-sm font-body mb-5 max-w-md mx-auto ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Get weekly BPSC tips, study resources, and motivation directly in
              your inbox.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className={`flex-1 w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-body
                  outline-none transition-all duration-300 ${
                    darkMode
                      ? "bg-navy-lighter/60 text-white placeholder-gray-500 border border-saffron/20 focus:border-saffron/50"
                      : "bg-white text-gray-700 placeholder-gray-400 border border-gray-200 focus:border-saffron"
                  }`}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-saffron
                  to-saffron-light text-navy font-heading font-bold text-sm
                  hover:shadow-neon-saffron transition-shadow duration-300"
              >
                Subscribe
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Blog;
