import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import useProfile from "../../hooks/useProfile";
import useVisitorTracking from "../../hooks/useVisitorTracking";
import { supabase } from "../../lib/supabase";
import DOMPurify from "dompurify";
import {
  FaArrowLeft,
  FaClock,
  FaCalendarAlt,
  FaEye,
  FaShareAlt,
  FaTwitter,
  FaLinkedinIn,
  FaWhatsapp,
  FaLink,
  FaChevronUp,
  FaEnvelope,
} from "react-icons/fa";
import { HiBookOpen } from "react-icons/hi";

/* ═══════════════════════════════════════════════
   HOOK: Detect mobile viewport
═══════════════════════════════════════════════ */
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
};

/* ═══════════════════════════════════════════════
   READING PROGRESS BAR
═══════════════════════════════════════════════ */
const ReadingProgress = () => {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-saffron via-gold to-saffron z-[60] origin-left"
      style={{ scaleX: scrollYProgress }}
    />
  );
};

/* ═══════════════════════════════════════════════
   FLOATING SHARE BAR (Desktop sidebar)
═══════════════════════════════════════════════ */
const FloatingShareBar = ({ title, url }) => {
  const [copied, setCopied] = useState(false);

  const share = (platform) => {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const links = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    };
    if (platform === "copy") {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return;
    }
    window.open(links[platform], "_blank", "noopener,noreferrer");
  };

  const btnClass =
    "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 bg-white hover:bg-saffron/10 text-gray-400 hover:text-saffron border border-gray-100 shadow-sm";

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1, duration: 0.5 }}
      className="hidden xl:flex fixed left-8 top-1/2 -translate-y-1/2 flex-col gap-3 z-50"
    >
      <button
        onClick={() => share("twitter")}
        className={btnClass}
        title="Share on Twitter"
      >
        <FaTwitter className="text-sm" />
      </button>
      <button
        onClick={() => share("linkedin")}
        className={btnClass}
        title="Share on LinkedIn"
      >
        <FaLinkedinIn className="text-sm" />
      </button>
      <button
        onClick={() => share("whatsapp")}
        className={btnClass}
        title="Share on WhatsApp"
      >
        <FaWhatsapp className="text-sm" />
      </button>
      <div className="w-full h-px bg-gray-200" />
      <button
        onClick={() => share("copy")}
        className={btnClass}
        title="Copy link"
      >
        {copied ? (
          <span className="text-emerald-500 text-[10px] font-bold">✓</span>
        ) : (
          <FaLink className="text-sm" />
        )}
      </button>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════
   AUTHOR SIGNATURE CARD
═══════════════════════════════════════════════ */
const AuthorSignature = ({ isMobile }) => {
  const { photoUrl, fullName, bio, email } = useProfile();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`mt-12 md:mt-16 rounded-2xl md:rounded-3xl overflow-hidden border border-gray-100 shadow-sm ${
        isMobile ? "bg-white" : "bg-gradient-to-br from-gray-50/80 to-white"
      }`}
    >
      <div className="h-1.5 bg-gradient-to-r from-saffron via-gold to-saffron" />

      <div className={`${isMobile ? "p-5" : "p-6 md:p-10"}`}>
        <div className="flex flex-col md:flex-row items-center md:items-start gap-5 md:gap-6">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 2 }}
            className="relative flex-shrink-0"
          >
            <div
              className={`${isMobile ? "w-20 h-20" : "w-24 h-24 md:w-28 md:h-28"} rounded-2xl overflow-hidden shadow-xl ring-4 ring-saffron/20`}
            >
              <img
                src={photoUrl}
                alt={fullName}
                className="w-full h-full object-cover object-center"
                loading="lazy"
                draggable="false"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r from-saffron to-gold flex items-center justify-center">
              <span className="text-white text-[10px]">✍️</span>
            </div>
          </motion.div>

          <div className="text-center md:text-left flex-1">
            <p className="text-[10px] font-heading font-bold tracking-[0.2em] uppercase mb-1 text-saffron">
              Written by
            </p>
            <h3 className="text-xl md:text-2xl font-heading font-bold mb-2 text-gray-900">
              {fullName}
            </h3>
            <p className="text-sm font-body leading-relaxed max-w-lg mb-4 text-gray-500">
              {bio}
            </p>
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-heading font-bold transition-all bg-gradient-to-r from-saffron to-gold text-white hover:shadow-lg hover:shadow-saffron/25"
              >
                <FaEnvelope className="text-[10px]" /> Get in Touch
              </a>
              <a
                href="/"
                className="px-4 py-2 rounded-xl text-xs font-heading font-semibold transition-all border border-gray-200 text-gray-500 hover:border-saffron hover:text-saffron"
              >
                View Portfolio
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════
   SCROLL TO TOP BUTTON
═══════════════════════════════════════════════ */
const ScrollToTop = () => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full bg-gradient-to-r from-saffron to-gold text-white shadow-xl shadow-saffron/25 flex items-center justify-center hover:scale-110 transition-transform"
        >
          <FaChevronUp className="text-sm" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

/* ═══════════════════════════════════════════════
   MOBILE SHARE SHEET
═══════════════════════════════════════════════ */
const MobileShareSheet = ({ title, url, show, onClose }) => {
  const share = (platform) => {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const links = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    };
    window.open(links[platform], "_blank", "noopener,noreferrer");
    onClose();
  };

  const copy = () => {
    navigator.clipboard.writeText(url);
    onClose();
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 z-[70]"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[80] bg-white rounded-t-3xl p-6 pb-10 shadow-2xl"
          >
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-6" />
            <p className="text-center text-gray-900 font-heading font-bold text-base mb-5">
              Share this article
            </p>
            <div className="flex justify-center gap-5">
              <button
                onClick={() => share("whatsapp")}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 text-xl">
                  <FaWhatsapp />
                </div>
                <span className="text-[10px] text-gray-500 font-heading">
                  WhatsApp
                </span>
              </button>
              <button
                onClick={() => share("twitter")}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 text-xl">
                  <FaTwitter />
                </div>
                <span className="text-[10px] text-gray-500 font-heading">
                  Twitter
                </span>
              </button>
              <button
                onClick={() => share("linkedin")}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-700 text-xl">
                  <FaLinkedinIn />
                </div>
                <span className="text-[10px] text-gray-500 font-heading">
                  LinkedIn
                </span>
              </button>
              <button
                onClick={copy}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-600 text-xl">
                  <FaLink />
                </div>
                <span className="text-[10px] text-gray-500 font-heading">
                  Copy Link
                </span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/* ═══════════════════════════════════════════════════════════════
   PROCESS CONTENT — Fix YouTube URLs, ensure links are proper
═══════════════════════════════════════════════════════════════ */
const processContent = (html) => {
  if (!html) return "";

  let processed = html;

  // 1. Convert plain YouTube URLs (in <p> tags or standalone) to responsive embeds
  const youtubeRegex =
    /(?:<p>)?\s*(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})(?:[^\s<]*)?\s*(?:<\/p>)?/gi;

  processed = processed.replace(youtubeRegex, (match, videoId) => {
    if (match.includes("<iframe")) return match;
    return `<div class="yt-responsive"><iframe src="https://www.youtube-nocookie.com/embed/${videoId}" title="YouTube video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe></div>`;
  });

  // 2. Handle TipTap's YouTube extension output (data-youtube-video wrappers)
  processed = processed.replace(
    /<div[^>]*data-youtube-video[^>]*>[\s\S]*?<iframe([^>]*)>[\s\S]*?<\/iframe>[\s\S]*?<\/div>/gi,
    (match, attrs) => {
      const srcMatch = attrs.match(/src="([^"]+)"/);
      const src = srcMatch ? srcMatch[1] : "";
      // Skip broken embeds with null/empty/invalid src
      if (!src || src === "null" || src === "undefined") {
        return "";
      }
      // Extract video ID and ensure we use the embed URL format
      let embedUrl = src;
      const idMatch = src.match(/(?:embed\/|watch\?v=|youtu\.be\/)([\w-]{11})/);
      if (idMatch) {
        embedUrl = `https://www.youtube-nocookie.com/embed/${idMatch[1]}`;
      }
      return `<div class="yt-responsive"><iframe src="${embedUrl}" title="YouTube video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe></div>`;
    },
  );

  // 3. Ensure all <a> tags have target="_blank" and rel="noopener noreferrer"
  processed = processed.replace(/<a([^>]*?)>/gi, (match, attrs) => {
    let newAttrs = attrs;
    if (!attrs.includes("target=")) {
      newAttrs += ' target="_blank"';
    }
    if (!attrs.includes("rel=")) {
      newAttrs += ' rel="noopener noreferrer"';
    }
    return `<a${newAttrs}>`;
  });

  return processed;
};

/* ═══════════════════════════════════════════════════════════════
   SANITIZE CONTENT with DOMPurify
═══════════════════════════════════════════════════════════════ */
const sanitizeContent = (html) => {
  const processed = processContent(html);
  return DOMPurify.sanitize(processed, {
    ADD_TAGS: ["iframe", "div"],
    ADD_ATTR: [
      "allow",
      "allowfullscreen",
      "frameborder",
      "src",
      "width",
      "height",
      "style",
      "target",
      "rel",
      "class",
      "data-youtube-video",
      "loading",
      "title",
    ],
  });
};

/* ═══════════════════════════════════════════════════════════════
   MAIN BLOG POST READER
   - Desktop: Premium light theme (Medium/Substack style)
   - Mobile: Modern card-based reading experience
═══════════════════════════════════════════════════════════════ */
const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { fullName, photoUrl } = useProfile();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const articleRef = useRef(null);

  /* Track blog visit — anti-spam, unique counting, server-side */
  useVisitorTracking({
    page: `/blog/${slug}`,
    blogSlug: slug,
    enabled: !!post,
  });

  /* Parallax hero (desktop only) */
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 1.05]);
  const heroY = useTransform(scrollYProgress, [0, 0.15], [0, 40]);

  /* Fetch post */
  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("slug", slug)
          .eq("is_published", true)
          .eq("is_deleted", false)
          .single();

        if (error || !data) {
          setNotFound(true);
          return;
        }
        setPost(data);

        // View counting is now handled by useVisitorTracking + api/track-visit.js
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
    window.scrollTo(0, 0);
  }, [slug]);

  /* Set page title and Open Graph meta */
  useEffect(() => {
    if (post) {
      document.title = `${post.title} — ${fullName}`;
      const setMeta = (property, content) => {
        let el = document.querySelector(`meta[property="${property}"]`);
        if (!el) {
          el = document.createElement("meta");
          el.setAttribute("property", property);
          document.head.appendChild(el);
        }
        el.setAttribute("content", content);
      };
      setMeta("og:title", post.title);
      setMeta("og:description", post.excerpt || "");
      setMeta("og:type", "article");
      setMeta("og:url", window.location.href);
      if (post.cover_image) setMeta("og:image", post.cover_image);

      return () => {
        document.title = `${fullName} — Portfolio`;
      };
    }
  }, [post, fullName]);

  /* Sanitized content */
  const sanitizedHTML = sanitizeContent(post?.content);

  /* Lazy load images after render */
  useEffect(() => {
    if (!articleRef.current) return;
    const imgs = articleRef.current.querySelectorAll("img");
    imgs.forEach((img) => {
      img.setAttribute("loading", "lazy");
      img.setAttribute("decoding", "async");
    });
  }, [sanitizedHTML]);

  /* ─── LOADING STATE ─── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-saffron border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-body text-gray-400">Loading article...</p>
        </div>
      </div>
    );
  }

  /* ─── 404 STATE ─── */
  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center px-6"
        >
          <span className="text-7xl block mb-6">📖</span>
          <h1 className="text-3xl font-heading font-bold mb-3 text-gray-900">
            Article Not Found
          </h1>
          <p className="text-sm font-body mb-8 text-gray-500">
            This blog post doesn&apos;t exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-saffron to-gold text-white font-heading font-bold text-sm hover:shadow-lg hover:shadow-saffron/25 transition-all"
          >
            ← Back to Portfolio
          </button>
        </motion.div>
      </div>
    );
  }

  const postDate = new Date(post.created_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const pageUrl = typeof window !== "undefined" ? window.location.href : "";
  const category = post.tags?.[0] || "General";

  /* ═══════════════════════════════════════════════
     MOBILE READER VIEW
     Modern card-based, thumb-friendly, big fonts
  ═══════════════════════════════════════════════ */
  if (isMobile) {
    return (
      <div className="min-h-screen bg-[#f5f5f7]">
        <ReadingProgress />
        <ScrollToTop />
        <MobileShareSheet
          title={post.title}
          url={pageUrl}
          show={showShareSheet}
          onClose={() => setShowShareSheet(false)}
        />

        {/* ── Sticky Mobile Header ── */}
        <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100 px-4 py-3 flex items-center justify-between safe-area-top">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-600 text-sm font-heading font-semibold active:scale-95 transition-transform"
          >
            <FaArrowLeft className="text-xs" /> Back
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: post.title, url: pageUrl });
              } else {
                setShowShareSheet(true);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-heading font-semibold text-saffron bg-saffron/10 active:bg-saffron/20 transition-colors"
          >
            <FaShareAlt className="text-[10px]" /> Share
          </button>
        </div>

        {/* ── Cover Image ── */}
        {post.cover_image && (
          <div className="relative">
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-56 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        )}

        {/* ── Article Card ── */}
        <div
          className={`bg-white mx-3 ${post.cover_image ? "-mt-8" : "mt-3"} rounded-2xl shadow-sm border border-gray-100 relative z-10`}
        >
          <div className="px-5 pt-5">
            <span className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-saffron to-gold text-[10px] font-heading font-bold text-white mb-3">
              {category}
            </span>
            <h1 className="text-[22px] font-heading font-bold text-gray-900 leading-tight mb-3">
              {post.title}
            </h1>

            {/* Author row */}
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <img
                src={photoUrl}
                alt={fullName}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-saffron/20"
                loading="lazy"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-heading font-bold text-gray-900 truncate">
                  {fullName}
                </p>
                <div className="flex items-center gap-3 text-[10px] text-gray-400 font-body">
                  <span className="flex items-center gap-1">
                    <FaCalendarAlt className="text-saffron" /> {postDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaClock className="text-saffron" /> {post.read_time || 5}{" "}
                    min
                  </span>
                  <span className="flex items-center gap-1">
                    <FaEye className="text-saffron" /> {post.views || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Excerpt */}
          {post.excerpt && (
            <div className="px-5 pt-4">
              <p className="text-[15px] font-serif italic leading-relaxed text-gray-500 pl-3 border-l-[3px] border-saffron/40">
                {post.excerpt}
              </p>
            </div>
          )}

          {/* ── Article Body ── */}
          <article
            ref={articleRef}
            className="blog-article-content mobile-blog-content px-5 pt-5 pb-6
              prose prose-base max-w-none font-body
              prose-headings:font-heading prose-headings:font-bold prose-headings:text-gray-900
              prose-h1:text-[22px] prose-h1:mb-4 prose-h1:mt-8
              prose-h2:text-xl prose-h2:mb-3 prose-h2:mt-7
              prose-h3:text-lg prose-h3:mb-2 prose-h3:mt-6
              prose-p:text-[15px] prose-p:leading-[1.9] prose-p:mb-4 prose-p:text-gray-700
              prose-a:text-saffron prose-a:underline prose-a:underline-offset-2 prose-a:decoration-saffron/40 hover:prose-a:decoration-saffron
              prose-img:rounded-xl prose-img:shadow-md prose-img:my-6 prose-img:w-full
              prose-blockquote:border-l-saffron prose-blockquote:bg-saffron/5 prose-blockquote:rounded-r-lg prose-blockquote:py-1 prose-blockquote:px-3 prose-blockquote:text-gray-600
              prose-code:text-saffron prose-code:bg-saffron/10 prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm
              prose-pre:rounded-xl prose-pre:bg-gray-900 prose-pre:text-sm prose-pre:overflow-x-auto
              prose-li:text-gray-700 prose-li:marker:text-saffron prose-li:text-[15px]
              prose-strong:text-gray-900
              prose-hr:border-gray-200
            "
            dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
          />
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mx-3 mt-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <HiBookOpen className="text-sm text-gray-400" />
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-xs font-heading font-semibold bg-gray-50 text-gray-500 border border-gray-100"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Author Card */}
        <div className="mx-3 mt-3">
          <AuthorSignature isMobile={true} />
        </div>

        {/* Back button */}
        <div className="text-center mt-6 mb-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-heading font-semibold bg-gradient-to-r from-saffron to-gold text-white shadow-lg shadow-saffron/20 active:scale-95 transition-transform"
          >
            <FaArrowLeft className="text-xs" /> Back to Portfolio
          </Link>
        </div>

        {/* Mobile blog styles */}
        <BlogStyles />
      </div>
    );
  }

  /* ═══════════════════════════════════════════════
     DESKTOP READER VIEW — Premium Light Theme
     Medium / Substack / Ghost inspired
  ═══════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-white" style={{ color: "#1a1a2e" }}>
      <ReadingProgress />
      <FloatingShareBar title={post.title} url={pageUrl} />
      <ScrollToTop />

      {/* ═══ HERO / COVER ═══ */}
      {post.cover_image ? (
        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
          className="relative overflow-hidden h-[60vh] max-h-[600px]"
        >
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Back button */}
          <div className="absolute top-6 left-6 z-20">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-heading font-semibold bg-white/15 backdrop-blur-xl text-white border border-white/20 hover:bg-white/25 transition-all"
            >
              <FaArrowLeft className="text-xs" /> Back
            </motion.button>
          </div>

          {/* Title overlay on cover */}
          <div className="absolute bottom-0 left-0 right-0 p-10 md:p-14 z-10">
            <div className="max-w-3xl mx-auto">
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-block px-3.5 py-1 rounded-full bg-gradient-to-r from-saffron to-gold text-xs font-heading font-bold text-navy mb-5 shadow-sm"
              >
                {category}
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl lg:text-[3.25rem] font-heading font-extrabold text-white leading-[1.15] tracking-tight"
                style={{ textShadow: "0 2px 30px rgba(0,0,0,0.4)" }}
              >
                {post.title}
              </motion.h1>
            </div>
          </div>
        </motion.div>
      ) : (
        /* No-cover variant: clean minimal header */
        <div className="relative bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, rgba(255,153,51,0.3) 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
          <div className="max-w-3xl mx-auto px-6 md:px-8 pt-8 pb-12 relative z-10">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-heading font-semibold bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 shadow-sm transition-all mb-8"
            >
              <FaArrowLeft className="text-xs" /> Back
            </motion.button>
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-block px-3.5 py-1 rounded-full bg-gradient-to-r from-saffron to-gold text-xs font-heading font-bold text-navy mb-5"
            >
              {category}
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl font-heading font-extrabold leading-[1.12] tracking-tight text-gray-900"
            >
              {post.title}
            </motion.h1>
          </div>
        </div>
      )}

      {/* ═══ CONTENT CARD — white card on subtle background ═══ */}
      <div className="relative z-10 bg-[#fafafa]">
        <div className="max-w-[780px] mx-auto px-6 md:px-10">
          {/* White article card */}
          <div
            className={`bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_8px_32px_rgba(0,0,0,0.04)] border border-gray-100/80 ${
              post.cover_image ? "-mt-12" : ""
            }`}
            style={{ color: "#374151" }}
          >
            {/* ── Meta bar ── */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center gap-5 px-8 md:px-10 py-7 border-b border-gray-100"
            >
              <div className="flex items-center gap-3.5">
                <img
                  src={photoUrl}
                  alt={fullName}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-saffron/20 shadow-sm"
                  loading="lazy"
                />
                <div>
                  <p className="text-sm font-heading font-bold text-gray-900">
                    {fullName}
                  </p>
                  <p className="text-[11px] font-body text-gray-400 mt-0.5">
                    Author
                  </p>
                </div>
              </div>

              <div className="hidden md:block w-px h-10 bg-gray-200" />

              <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1.5 text-xs font-body text-gray-500">
                  <FaCalendarAlt className="text-saffron text-[11px]" />{" "}
                  {postDate}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-body text-gray-500">
                  <FaClock className="text-saffron text-[11px]" />{" "}
                  {post.read_time || 5} min read
                </span>
                <span className="flex items-center gap-1.5 text-xs font-body text-gray-500">
                  <FaEye className="text-saffron text-[11px]" />{" "}
                  {post.views || 0} views
                </span>
              </div>
            </motion.div>

            {/* ── Excerpt ── */}
            {post.excerpt && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="px-8 md:px-10 pt-8"
              >
                <p className="text-lg font-serif italic leading-relaxed text-gray-500 pl-5 border-l-[3px] border-saffron/40">
                  {post.excerpt}
                </p>
              </motion.div>
            )}

            {/* ═══ ARTICLE BODY ═══ */}
            <motion.article
              ref={articleRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="blog-article-content desktop-blog-content
                px-8 md:px-10 pt-8 pb-10
                prose prose-lg max-w-none font-body
                prose-headings:font-heading prose-headings:font-bold prose-headings:text-gray-900
                prose-h1:text-[30px] prose-h1:mb-5 prose-h1:mt-10 prose-h1:leading-tight
                prose-h2:text-[24px] prose-h2:mb-4 prose-h2:mt-9 prose-h2:leading-snug
                prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-7
                prose-p:text-[17px] prose-p:leading-[1.85] prose-p:mb-5
                prose-a:text-saffron prose-a:underline prose-a:underline-offset-4 prose-a:decoration-saffron/40 hover:prose-a:decoration-saffron prose-a:font-medium prose-a:transition-colors
                prose-img:rounded-xl prose-img:shadow-md prose-img:my-8
                prose-blockquote:border-l-saffron prose-blockquote:bg-amber-50/50 prose-blockquote:rounded-r-xl prose-blockquote:py-2 prose-blockquote:px-5 prose-blockquote:not-italic
                prose-code:text-saffron prose-code:bg-saffron/10 prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:font-mono
                prose-pre:rounded-xl prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-200 prose-pre:shadow-inner
                prose-li:marker:text-saffron prose-li:text-[17px] prose-li:leading-[1.8]
                prose-strong:font-bold
                prose-hr:border-gray-200
                prose-figure:my-8
                prose-table:text-sm
              "
              style={{ color: "#374151" }}
              dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
            />

            {/* ── Tags ── */}
            {post.tags && post.tags.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="flex flex-wrap items-center gap-2.5 mx-8 md:mx-10 pt-6 pb-8 border-t border-gray-100"
              >
                <HiBookOpen className="text-sm text-gray-400 mr-1" />
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3.5 py-1.5 rounded-full text-xs font-heading font-semibold bg-gray-50 text-gray-500 border border-gray-200 hover:border-saffron hover:text-saffron transition-colors cursor-default"
                  >
                    #{tag}
                  </span>
                ))}
              </motion.div>
            )}
          </div>

          {/* ── Author Signature (outside card) ── */}
          <AuthorSignature isMobile={false} />

          {/* ── Back ── */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-10 mb-16"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-heading font-semibold bg-gradient-to-r from-saffron to-gold text-white hover:shadow-lg hover:shadow-saffron/25 transition-all"
            >
              <FaArrowLeft className="text-xs" /> Back to Portfolio
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Desktop blog styles */}
      <BlogStyles />
    </div>
  );
};

/* ═══════════════════════════════════════════════
   BLOG CSS — YouTube responsive, links, media
═══════════════════════════════════════════════ */
const BlogStyles = () => (
  <style>{`
    /* ═══ FORCE LIGHT TEXT COLORS ON DESKTOP ═══ */
    .desktop-blog-content,
    .desktop-blog-content * {
      color: inherit;
    }
    .desktop-blog-content {
      color: #374151 !important;
    }
    .desktop-blog-content h1,
    .desktop-blog-content h2,
    .desktop-blog-content h3,
    .desktop-blog-content h4,
    .desktop-blog-content h5,
    .desktop-blog-content h6 {
      color: #111827 !important;
    }
    .desktop-blog-content p,
    .desktop-blog-content li,
    .desktop-blog-content td,
    .desktop-blog-content th,
    .desktop-blog-content dd,
    .desktop-blog-content dt {
      color: #374151 !important;
    }
    .desktop-blog-content strong,
    .desktop-blog-content b {
      color: #111827 !important;
    }
    .desktop-blog-content blockquote,
    .desktop-blog-content blockquote p {
      color: #6b7280 !important;
    }

    /* ── Responsive YouTube Embeds ── */
    .blog-article-content .yt-responsive {
      position: relative;
      width: 100%;
      padding-bottom: 56.25%;
      height: 0;
      overflow: hidden;
      border-radius: 16px;
      margin: 2rem 0;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      background: #f3f4f6;
    }
    .blog-article-content .yt-responsive iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: 0;
      border-radius: 16px;
    }

    /* TipTap YouTube data-youtube-video wrapper */
    .blog-article-content div[data-youtube-video] {
      position: relative;
      width: 100%;
      padding-bottom: 56.25%;
      height: 0;
      overflow: hidden;
      border-radius: 16px;
      margin: 2rem 0;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      background: #f3f4f6;
    }
    .blog-article-content div[data-youtube-video] iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100% !important;
      height: 100% !important;
      border: 0;
      border-radius: 16px;
    }

    /* Remove empty src iframes to avoid black box */
    .blog-article-content iframe[src=""],
    .blog-article-content iframe:not([src]) {
      display: none !important;
    }

    /* ── Link styling ── */
    .blog-article-content a {
      color: #FF9933 !important;
      text-decoration: underline;
      text-underline-offset: 3px;
      text-decoration-color: rgba(255, 153, 51, 0.4);
      font-weight: 500;
      transition: all 0.2s ease;
      word-break: break-word;
    }
    .blog-article-content a:hover {
      text-decoration-color: #FF9933;
      color: #e68a2e !important;
    }

    /* ── Document attachment links ── */
    .blog-article-content a[href*="blog-doc-"] {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 10px 18px;
      background: #f8f9fa;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      text-decoration: none;
      font-size: 14px;
      font-weight: 600;
      color: #374151 !important;
      transition: all 0.2s;
    }
    .blog-article-content a[href*="blog-doc-"]:hover {
      border-color: #FF9933;
      color: #FF9933 !important;
      background: rgba(255, 153, 51, 0.05);
    }

    /* ── Images ── */
    .blog-article-content img {
      max-width: 100%;
      height: auto;
    }

    /* ── Code blocks ── */
    .desktop-blog-content pre {
      color: #e5e7eb !important;
      background: #1f2937 !important;
    }
    .desktop-blog-content pre code {
      color: #e5e7eb !important;
    }
    .desktop-blog-content code:not(pre code) {
      color: #FF9933 !important;
    }

    /* ── Mobile tweaks ── */
    .mobile-blog-content .yt-responsive,
    .mobile-blog-content div[data-youtube-video] {
      border-radius: 12px;
      margin: 1.5rem 0;
    }
    .mobile-blog-content .yt-responsive iframe,
    .mobile-blog-content div[data-youtube-video] iframe {
      border-radius: 12px;
    }
    .mobile-blog-content img {
      border-radius: 12px;
    }

    /* ── Selection highlight ── */
    .blog-article-content ::selection {
      background: rgba(255, 153, 51, 0.2);
      color: inherit;
    }

    /* ── Safe area for iOS ── */
    .safe-area-top {
      padding-top: max(12px, env(safe-area-inset-top));
    }
  `}</style>
);

export default BlogPost;
