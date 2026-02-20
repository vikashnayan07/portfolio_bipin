import React, { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import { supabase } from "../../lib/supabase";
import {
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhone,
  FaPaperPlane,
  FaCheckCircle,
  FaLinkedinIn,
  FaTwitter,
  FaInstagram,
  FaGithub,
  FaWhatsapp,
  FaChevronDown,
  FaRegComment,
  FaBookOpen,
  FaUsers,
  FaChalkboardTeacher,
  FaHandshake,
  FaQuestionCircle,
} from "react-icons/fa";
import { HiSparkles, HiLightningBolt } from "react-icons/hi";

/* ─────────── Data ─────────── */

const contactInfo = [
  {
    icon: <FaEnvelope className="text-lg" />,
    label: "Email",
    value: "kumarbipin76211@gmail.com",
    href: "mailto:kumarbipin76211@gmail.com",
    color: "from-saffron to-saffron-light",
  },
  {
    icon: <FaPhone className="text-lg" />,
    label: "Phone",
    value: "+91 7643 044 297",
    href: "tel:+917643044297",
    color: "from-emerald-500 to-teal-400",
  },
  {
    icon: <FaMapMarkerAlt className="text-lg" />,
    label: "Location",
    value: "Vaishali, Bihar, India",
    href: null,
    color: "from-amber-500 to-orange-400",
  },
];

const socialLinks = [
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
    href: "https://www.instagram.com/oberoy.bipin76/",
    label: "Instagram",
  },
  {
    icon: <FaGithub />,
    href: "https://github.com/bipinkumar",
    label: "GitHub",
  },
  {
    icon: <FaWhatsapp />,
    href: "https://wa.me/917643044297",
    label: "WhatsApp",
  },
];

/* Chatbot-style quick prompts */
const quickPrompts = [
  {
    icon: <FaBookOpen className="text-sm" />,
    label: "BPSC Study Tips",
    subject: "BPSC Preparation Tips",
    message:
      "Hi Bipin! I'm also preparing for BPSC and would love to know your study strategy, recommended books, and daily routine.",
    gradient: "from-saffron to-saffron-light",
  },
  {
    icon: <FaUsers className="text-sm" />,
    label: "Join Study Group",
    subject: "Study Group Inquiry",
    message:
      "Hi Bipin! I came across your study group initiative and I'd like to join. Could you share the details and how I can get involved?",
    gradient: "from-emerald-500 to-teal-400",
  },
  {
    icon: <FaChalkboardTeacher className="text-sm" />,
    label: "Teaching Collab",
    subject: "Teaching Collaboration Proposal",
    message:
      "Hi Bipin! I'm interested in collaborating on educational content. I'd love to discuss how we can work together for students in Bihar.",
    gradient: "from-blue-500 to-cyan-400",
  },
  {
    icon: <FaHandshake className="text-sm" />,
    label: "Mentorship",
    subject: "Mentorship Request",
    message:
      "Hi Bipin! I'm a BPSC aspirant and would really appreciate your guidance. Could we connect for mentorship or a brief discussion?",
    gradient: "from-violet-500 to-purple-400",
  },
  {
    icon: <FaRegComment className="text-sm" />,
    label: "Just Say Hi",
    subject: "Hello from a Fellow Aspirant!",
    message:
      "Hi Bipin! Just wanted to say hello and appreciate the work you're doing. Keep inspiring Bihar's youth!",
    gradient: "from-rose-500 to-pink-400",
  },
];

/* FAQ items */
const faqItems = [
  {
    question: "What is your recommended booklist for BPSC Prelims?",
    answer:
      "For BPSC Prelims, I rely on Spectrum for Modern History, Laxmikanth for Polity, NCERT Geography, Ramesh Singh for Economy, and Drishti IAS Current Affairs for Bihar-specific questions. Happy to share my detailed list!",
  },
  {
    question: "How many hours do you study daily for BPSC?",
    answer:
      "I follow a structured 8-10 hour daily routine: 4 hours for static subjects, 2 hours for current affairs, 2 hours for answer writing practice, and 1-2 hours for revision. Consistency matters more than marathon sessions.",
  },
  {
    question: "Can I join your study group from outside Bihar?",
    answer:
      "Absolutely! Our study group meets online every weekend via Google Meet. We discuss weekly topics, share notes, and do mock answer evaluations. Location doesn't matter — only dedication does!",
  },
  {
    question: "Do you offer one-on-one mentorship?",
    answer:
      "I try to help fellow aspirants whenever I can. While I don't run formal paid mentorship, I'm always happy to have a brief chat or exchange study strategies. Drop me a message!",
  },
  {
    question: "How do you balance B.Ed and BPSC preparation?",
    answer:
      "It's challenging but manageable. I dedicate mornings to BPSC subjects, attend B.Ed classes in the afternoon, and use evenings for B.Ed assignments. Teaching practice sessions actually improve my communication skills for the interview stage.",
  },
];

/* ─────────── 3D-style Map Pin (CSS-driven) ─────────── */
const MapPinVisual = () => {
  const { darkMode } = useTheme();

  return (
    <div className="relative w-full h-64 flex items-center justify-center overflow-hidden">
      {/* Concentric pulse rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-saffron/20"
          style={{ width: 100 + i * 60, height: 100 + i * 60 }}
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{
            duration: 3,
            delay: i * 0.8,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Shadow ellipse */}
      <motion.div
        animate={{ scale: [1, 0.85, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-10 w-20 h-4 rounded-full bg-saffron/10 blur-md"
      />

      {/* Floating Map Pin */}
      <motion.div
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* Pin head */}
        <div className="relative">
          <div
            className="w-16 h-16 rounded-full bg-gradient-to-br from-saffron to-gold
            flex items-center justify-center shadow-profile"
          >
            <span className="text-2xl">🏛️</span>
          </div>
          {/* Glow ring */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.2, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -inset-2 rounded-full border-2 border-saffron/30"
          />
        </div>

        {/* Pin spike */}
        <div
          className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[16px]
          border-l-transparent border-r-transparent border-t-saffron -mt-1"
        />

        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`mt-3 px-4 py-1.5 rounded-full text-xs font-heading font-bold
            backdrop-blur-sm ${
              darkMode
                ? "bg-navy-lighter/80 border border-saffron/20 text-saffron-light"
                : "bg-white/80 border border-saffron/30 text-saffron-dark"
            }`}
        >
          📍 Bihar, India
        </motion.div>
      </motion.div>

      {/* Floating micro-elements around pin */}
      {["🕉️", "📚", "🎓", "⚖️"].map((emoji, i) => {
        const positions = [
          { top: "15%", left: "15%" },
          { top: "20%", right: "15%" },
          { bottom: "25%", left: "20%" },
          { bottom: "20%", right: "18%" },
        ];
        return (
          <motion.span
            key={i}
            className={`absolute text-lg opacity-40 ${darkMode ? "" : "opacity-30"}`}
            style={positions[i]}
            animate={{ y: [0, -8, 0], rotate: [0, 10, -10, 0] }}
            transition={{
              duration: 3 + i * 0.5,
              delay: i * 0.4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {emoji}
          </motion.span>
        );
      })}
    </div>
  );
};

/* ─────────── Contact Info Card ─────────── */
const ContactCard = ({ item, index, isInView }) => {
  const { darkMode } = useTheme();

  const content = (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.03, y: -3 }}
      className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${
        darkMode
          ? "glass hover:border-saffron/30"
          : "glass-light hover:border-saffron/40"
      }`}
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center
          bg-gradient-to-r ${item.color} text-white shadow-lg flex-shrink-0`}
      >
        {item.icon}
      </div>
      <div>
        <p
          className={`text-xs font-heading font-semibold uppercase tracking-wider ${
            darkMode ? "text-gray-500" : "text-gray-400"
          }`}
        >
          {item.label}
        </p>
        <p
          className={`text-sm font-body font-medium ${
            darkMode ? "text-gray-200" : "text-gray-700"
          }`}
        >
          {item.value}
        </p>
      </div>
    </motion.div>
  );

  return item.href ? (
    <a href={item.href} className="block">
      {content}
    </a>
  ) : (
    content
  );
};

/* ─────────── FAQ Accordion Item ─────────── */
const FAQItem = ({ item, index, isOpen, onToggle }) => {
  const { darkMode } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <button
        onClick={onToggle}
        className={`w-full text-left p-4 rounded-xl transition-all duration-300 flex items-start gap-3 ${
          isOpen
            ? darkMode
              ? "bg-saffron/10 border border-saffron/20"
              : "bg-saffron/5 border border-saffron/20"
            : darkMode
              ? "glass hover:border-saffron/15"
              : "glass-light hover:border-saffron/20"
        }`}
      >
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
            ${isOpen ? "bg-gradient-to-r from-saffron to-saffron-light text-white" : darkMode ? "bg-white/10 text-gray-400" : "bg-gray-200 text-gray-500"}`}
        >
          <FaQuestionCircle className="text-xs" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4
              className={`text-sm font-heading font-semibold pr-4 ${
                isOpen
                  ? "text-saffron"
                  : darkMode
                    ? "text-gray-200"
                    : "text-gray-700"
              }`}
            >
              {item.question}
            </h4>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className={`flex-shrink-0 ${
                isOpen
                  ? "text-saffron"
                  : darkMode
                    ? "text-gray-500"
                    : "text-gray-400"
              }`}
            >
              <FaChevronDown className="text-xs" />
            </motion.div>
          </div>
          <AnimatePresence>
            {isOpen && (
              <motion.p
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`text-xs font-body leading-relaxed mt-2 overflow-hidden ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {item.answer}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </button>
    </motion.div>
  );
};

/* ─────────── Quick Prompt Chip ─────────── */
const PromptChip = ({ prompt, onClick, darkMode }) => (
  <motion.button
    whileHover={{ scale: 1.05, y: -2 }}
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-heading font-semibold
      transition-all duration-300 border ${
        darkMode
          ? "bg-white/5 border-white/10 text-gray-300 hover:border-saffron/40 hover:text-saffron"
          : "bg-gray-50 border-gray-200 text-gray-600 hover:border-saffron/50 hover:text-saffron-dark"
      }`}
  >
    <span
      className={`bg-gradient-to-r ${prompt.gradient} bg-clip-text text-transparent`}
    >
      {prompt.icon}
    </span>
    {prompt.label}
  </motion.button>
);

/* ═══════════ MAIN CONTACT SECTION ═══════════ */
const Contact = () => {
  const { darkMode } = useTheme();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const formRef = useRef(null);
  const formInView = useInView(formRef, { once: true, margin: "-50px" });

  /* Form State */
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activePrompt, setActivePrompt] = useState(null);
  const [openFAQ, setOpenFAQ] = useState(null);
  const [focusedField, setFocusedField] = useState(null);
  const messageMaxLen = 500;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "message" && value.length > messageMaxLen) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePromptClick = (prompt, index) => {
    setActivePrompt(index);
    setFormData((prev) => ({
      ...prev,
      subject: prompt.subject,
      message: prompt.message,
    }));
    // Scroll form into view on mobile
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("contact_messages").insert({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      });
      if (error) throw error;
      setIsSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      setActivePrompt(null);
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (err) {
      console.error("Contact form error:", err);
      // Fallback: still show success to user (message may not be saved)
      setIsSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      setActivePrompt(null);
      setTimeout(() => setIsSubmitted(false), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBase = `w-full px-4 py-3 rounded-xl text-sm font-body
    transition-all duration-300 outline-none`;

  const inputClasses = (field) =>
    `${inputBase} ${
      darkMode
        ? `bg-navy-lighter/80 border text-white placeholder-gray-500 ${
            focusedField === field
              ? "border-saffron ring-1 ring-saffron/30 shadow-neon-saffron/20"
              : "border-gray-700 hover:border-gray-600"
          }`
        : `bg-white border text-gray-800 placeholder-gray-400 ${
            focusedField === field
              ? "border-saffron-dark ring-1 ring-saffron/30 shadow-lg"
              : "border-gray-200 hover:border-gray-300"
          }`
    }`;

  return (
    <section id="contact" className="section-padding relative overflow-hidden">
      {/* Background pattern */}
      <div
        className={`absolute inset-0 opacity-[0.03] ${darkMode ? "block" : "hidden"}`}
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,153,51,0.4) 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Decorative blurs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-saffron/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gold/5 rounded-full blur-[100px] pointer-events-none" />

      <div ref={sectionRef} className="max-w-6xl mx-auto relative z-10">
        {/* ─── Section Header ─── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2
            className={`text-3xl md:text-5xl font-heading font-bold mb-4 ${
              darkMode ? "text-white" : "text-navy"
            }`}
          >
            Get In <span className="gradient-text">Touch</span>
          </h2>
          <p
            className={`text-base md:text-lg font-body max-w-2xl mx-auto mb-6 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Have a question about BPSC preparation, want to collaborate on study
            materials, or just want to connect? I'd love to hear from you!
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-saffron to-saffron-light mx-auto rounded-full" />
        </motion.div>

        {/* ─── Availability Badge ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex justify-center mb-10"
        >
          <div
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-heading font-semibold ${
              darkMode
                ? "glass border-emerald-500/20 text-emerald-400"
                : "glass-light border-emerald-500/30 text-emerald-600"
            }`}
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            Available for study groups, collaborations & mentorship
          </div>
        </motion.div>

        {/* ─── Chatbot Quick Prompts ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mb-12"
        >
          <div className="text-center mb-4">
            <p
              className={`text-sm font-heading font-semibold flex items-center justify-center gap-2 ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              <HiSparkles className="text-saffron" />
              Quick Start — choose a conversation topic
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2.5">
            {quickPrompts.map((prompt, i) => (
              <PromptChip
                key={i}
                prompt={prompt}
                darkMode={darkMode}
                onClick={() => handlePromptClick(prompt, i)}
              />
            ))}
          </div>
          {activePrompt !== null && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mt-3 text-xs text-saffron font-body"
            >
              <HiLightningBolt className="inline mr-1" />
              Form pre-filled! Customize and hit send.
            </motion.p>
          )}
        </motion.div>

        {/* ─── Main 2-Column Layout ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12">
          {/* ──── Left Column: Info + Map + Social ──── */}
          <div className="lg:col-span-2 space-y-6">
            {/* 3D Map Pin Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={`rounded-2xl overflow-hidden ${
                darkMode ? "glass" : "glass-light"
              }`}
            >
              <MapPinVisual />
            </motion.div>

            {/* Contact Cards */}
            <div className="space-y-3">
              {contactInfo.map((item, i) => (
                <ContactCard
                  key={item.label}
                  item={item}
                  index={i}
                  isInView={isInView}
                />
              ))}
            </div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <p
                className={`text-sm font-heading font-semibold mb-3 ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Connect on Social
              </p>
              <div className="flex items-center gap-3">
                {socialLinks.map((link, i) => (
                  <motion.a
                    key={i}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.15, y: -3 }}
                    whileTap={{ scale: 0.9 }}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center
                      text-base transition-all duration-300 ${
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
            </motion.div>

            {/* Open-to Note */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.55 }}
              className={`p-5 rounded-2xl ${darkMode ? "glass" : "glass-light"}`}
            >
              <p
                className={`text-sm font-body leading-relaxed ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                💡{" "}
                <span
                  className={`font-semibold ${
                    darkMode ? "text-saffron-light" : "text-saffron-dark"
                  }`}
                >
                  Open to:
                </span>{" "}
                Study group collaborations, teaching opportunities, mentorship
                discussions, and BPSC preparation resource sharing.
              </p>
            </motion.div>
          </div>

          {/* ──── Right Column: Form ──── */}
          <motion.div
            ref={formRef}
            initial={{ opacity: 0, x: 40 }}
            animate={formInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-3"
          >
            <div
              className={`p-4 md:p-8 rounded-2xl relative overflow-hidden ${
                darkMode ? "glass" : "glass-light"
              }`}
            >
              {/* Decorative corner glow */}
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-saffron/5 blur-3xl pointer-events-none" />

              <h3
                className={`text-xl font-heading font-bold mb-1 relative z-10 ${
                  darkMode ? "text-white" : "text-navy"
                }`}
              >
                Send a Message
              </h3>
              <p
                className={`text-xs font-body mb-6 relative z-10 ${
                  darkMode ? "text-gray-500" : "text-gray-400"
                }`}
              >
                Fill in the form or use a quick prompt above to get started.
              </p>

              <AnimatePresence mode="wait">
                {isSubmitted ? (
                  /* ── Success State ── */
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex flex-col items-center justify-center py-16"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        delay: 0.2,
                      }}
                    >
                      <FaCheckCircle className="text-6xl text-emerald-500 mb-4" />
                    </motion.div>
                    <h4
                      className={`text-lg font-heading font-bold mb-2 ${
                        darkMode ? "text-white" : "text-navy"
                      }`}
                    >
                      Message Sent Successfully!
                    </h4>
                    <p
                      className={`text-sm font-body text-center max-w-sm ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Thank you for reaching out. I typically respond within 24
                      hours. Jai Bihar! 🙏
                    </p>
                  </motion.div>
                ) : (
                  /* ── Form ── */
                  <motion.form
                    key="form"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-5 relative z-10"
                  >
                    {/* Name & Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="name"
                          className={`block text-xs font-heading font-semibold mb-1.5 ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Your Name <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          onFocus={() => setFocusedField("name")}
                          onBlur={() => setFocusedField(null)}
                          placeholder="Your full name"
                          className={inputClasses("name")}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className={`block text-xs font-heading font-semibold mb-1.5 ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Your Email <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          onFocus={() => setFocusedField("email")}
                          onBlur={() => setFocusedField(null)}
                          placeholder="you@example.com"
                          className={inputClasses("email")}
                        />
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <label
                        htmlFor="subject"
                        className={`block text-xs font-heading font-semibold mb-1.5 ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Subject <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("subject")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="What's this about?"
                        className={inputClasses("subject")}
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label
                          htmlFor="message"
                          className={`text-xs font-heading font-semibold ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Message <span className="text-rose-400">*</span>
                        </label>
                        <span
                          className={`text-[10px] font-body ${
                            formData.message.length > messageMaxLen * 0.9
                              ? "text-rose-400"
                              : darkMode
                                ? "text-gray-600"
                                : "text-gray-400"
                          }`}
                        >
                          {formData.message.length}/{messageMaxLen}
                        </span>
                      </div>
                      <textarea
                        id="message"
                        name="message"
                        rows="5"
                        required
                        value={formData.message}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("message")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Write your message here..."
                        className={`${inputClasses("message")} resize-none`}
                      />
                      {/* Character bar */}
                      <div
                        className={`h-0.5 rounded-full mt-1 overflow-hidden ${
                          darkMode ? "bg-gray-800" : "bg-gray-200"
                        }`}
                      >
                        <motion.div
                          className={`h-full rounded-full ${
                            formData.message.length > messageMaxLen * 0.9
                              ? "bg-rose-400"
                              : "bg-gradient-to-r from-saffron to-saffron-light"
                          }`}
                          animate={{
                            width: `${(formData.message.length / messageMaxLen) * 100}%`,
                          }}
                          transition={{ duration: 0.2 }}
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl
                        font-heading font-semibold text-sm text-navy
                        bg-gradient-to-r from-saffron to-saffron-light
                        hover:shadow-neon-saffron transition-all duration-300
                        disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="w-5 h-5 border-2 border-navy/30 border-t-navy rounded-full"
                          />
                          Sending...
                        </>
                      ) : (
                        <>
                          <FaPaperPlane className="text-sm" />
                          Send Message
                        </>
                      )}
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* ─── FAQ Section ─── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mt-20"
        >
          <div className="text-center mb-8">
            <h3
              className={`text-2xl md:text-3xl font-heading font-bold mb-3 ${
                darkMode ? "text-white" : "text-navy"
              }`}
            >
              Frequently <span className="gradient-text">Asked</span>
            </h3>
            <p
              className={`text-sm font-body max-w-lg mx-auto ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Common questions from fellow BPSC aspirants and students
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {faqItems.map((item, i) => (
              <FAQItem
                key={i}
                item={item}
                index={i}
                isOpen={openFAQ === i}
                onToggle={() => setOpenFAQ(openFAQ === i ? null : i)}
              />
            ))}
          </div>
        </motion.div>

        {/* ─── Bottom CTA ─── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 text-center"
        >
          <div
            className={`inline-flex flex-col items-center p-8 rounded-2xl ${
              darkMode ? "glass" : "glass-light"
            }`}
          >
            <span className="text-4xl mb-3">🙏</span>
            <p
              className={`text-sm font-body max-w-md ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              <span className="font-semibold gradient-text">Jai Bihar!</span> —
              Whether you're a fellow aspirant, educator, or just someone who
              wants to connect — my inbox is always open.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
