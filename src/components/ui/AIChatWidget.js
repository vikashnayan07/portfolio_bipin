import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

/**
 * AIChatWidget — Floating chat bubble with a pre-scripted BPSC study assistant.
 * Client-side FAQ bot with typewriter effect. No API key needed.
 */

/* ─── Knowledge Base ─── */
const qaDatabase = [
  {
    keywords: ["bpsc", "exam", "pattern", "syllabus"],
    answer:
      "BPSC conducts the Combined Competitive Exam in 3 stages: Prelims (150 MCQs on GS), Mains (GS-I, GS-II, Optional + Hindi/Essay), and Interview. I'm preparing for all stages systematically! 📚",
  },
  {
    keywords: ["study", "routine", "schedule", "daily"],
    answer:
      "My typical day: 5 AM wake up → 2 hours Current Affairs → 3 hours GS core subjects → B.Ed classes → Evening revision + answer writing practice → Mock tests on weekends. Consistency is key! ⏰",
  },
  {
    keywords: ["bihar", "home", "from", "where"],
    answer:
      "I'm from Bihar — the land of Nalanda, Vikramshila, and great leaders like Chanakya! Bihar's rich history inspires me every day in my preparation journey. 🙏",
  },
  {
    keywords: ["b.ed", "teaching", "education", "bed"],
    answer:
      "I'm currently pursuing my B.Ed degree alongside BPSC preparation. Teaching pedagogy, child psychology, and classroom management are key areas I'm learning. Education is my passion! 🎓",
  },
  {
    keywords: ["project", "work", "portfolio"],
    answer:
      "Check out the Projects section! I've worked on study planners, current affairs trackers, and educational resource tools. Each project reflects my commitment to smart preparation. 💻",
  },
  {
    keywords: ["skill", "strength", "good"],
    answer:
      "My key strengths: Indian History (90%), Bihar GK (88%), Essay Writing (88%), Ethics (92%), and Hindi/English Proficiency (88%). Scroll to the Skills section for the full breakdown! 💪",
  },
  {
    keywords: ["contact", "hire", "reach", "connect", "email"],
    answer:
      "I'd love to connect! Scroll down to the Contact section or click 'Let's Connect' in the hero. You can reach me through the contact form, and I'll respond within 24 hours. 📩",
  },
  {
    keywords: ["hello", "hi", "hey", "namaste", "namaskar"],
    answer:
      "Namaste! 🙏 Welcome to my portfolio. I'm Bipin Kumar — BPSC aspirant and B.Ed student from Bihar. Feel free to ask me anything about my journey, preparation, or projects!",
  },
  {
    keywords: ["hobby", "interest", "free time", "fun"],
    answer:
      "Besides studying, I enjoy reading biographies of great leaders, debating current affairs with friends, and exploring Bihar's historical sites. Knowledge is the best hobby! 📖",
  },
  {
    keywords: ["goal", "dream", "ambition", "future", "vision"],
    answer:
      "My dream: Crack BPSC and serve as a civil servant in Bihar, while promoting quality education in rural areas. 'From Student to Civil Servant — One Step at a Time.' 🌟",
  },
  {
    keywords: ["tip", "advice", "suggestion", "help"],
    answer:
      "My top tips: 1) NCERT is your Bible 📕 2) Daily answer writing practice 3) Read the newspaper EVERY day 4) Take mock tests weekly 5) Never skip revision. Stay consistent! 🎯",
  },
  {
    keywords: ["book", "resource", "recommend", "read"],
    answer:
      "Must-reads: Laxmikanth (Polity), Spectrum (Modern India), Shankar IAS (Environment), Bihar through the Ages (Bihar GK), and daily The Hindu/Indian Express for current affairs! 📚",
  },
];

const defaultResponse =
  "That's a great question! I'm Bipin Kumar — a BPSC aspirant and B.Ed student. Try asking about my study routine, BPSC preparation, skills, projects, or my vision for the future! 😊";

/* ─── Quick Prompt Chips ─── */
const quickPrompts = [
  "👋 Say Hello",
  "📚 Study Routine",
  "🎯 BPSC Pattern",
  "💪 Your Skills",
  "🔮 Future Goals",
];

/* ─── Find Best Answer ─── */
const findAnswer = (input) => {
  const lower = input.toLowerCase();
  let bestMatch = null;
  let bestScore = 0;

  for (const qa of qaDatabase) {
    const score = qa.keywords.reduce(
      (acc, kw) => acc + (lower.includes(kw) ? 1 : 0),
      0,
    );
    if (score > bestScore) {
      bestScore = score;
      bestMatch = qa;
    }
  }
  return bestScore > 0 ? bestMatch.answer : defaultResponse;
};

/* ─── Typing Indicator ─── */
const TypingIndicator = ({ darkMode }) => (
  <div className="flex items-center gap-1.5 px-4 py-3">
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className={`w-2 h-2 rounded-full ${darkMode ? "bg-saffron/60" : "bg-saffron-dark/60"}`}
        animate={{ y: [0, -6, 0] }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          delay: i * 0.15,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
);

/* ─── Chat Message Bubble ─── */
const ChatBubble = ({ message, darkMode }) => {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}
    >
      {!isUser && (
        <div
          className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-saffron to-gold
            flex items-center justify-center mr-2 mt-1"
        >
          <span className="text-[10px] font-bold text-navy">BK</span>
        </div>
      )}
      <div
        className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
          ${
            isUser
              ? darkMode
                ? "bg-saffron/20 text-saffron-light rounded-br-md"
                : "bg-saffron/15 text-saffron-dark rounded-br-md"
              : darkMode
                ? "bg-navy-lighter/80 text-gray-200 rounded-bl-md border border-white/5"
                : "bg-gray-100 text-gray-700 rounded-bl-md border border-gray-200"
          }`}
      >
        {message.text}
      </div>
    </motion.div>
  );
};

/* ─── Main Widget ─── */
const AIChatWidget = () => {
  const { darkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Namaste! 🙏 I'm Bipin's Study Assistant. Ask me anything about his BPSC journey, skills, or projects!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const handleSend = useCallback(
    (text = input.trim()) => {
      if (!text) return;

      const userMsg = { role: "user", text };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsTyping(true);

      // Simulate thinking delay + typewriter
      const answer = findAnswer(text);
      const delay = 800 + Math.random() * 700;

      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [...prev, { role: "assistant", text: answer }]);
      }, delay);
    },
    [input],
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* ─── Floating Toggle Button ─── */}
      <motion.button
        onClick={() => {
          setIsOpen(!isOpen);
          setTimeout(() => inputRef.current?.focus(), 300);
        }}
        className={`fixed bottom-6 right-6 z-[999] w-14 h-14 rounded-full
          flex items-center justify-center shadow-lg
          transition-colors duration-300 group
          ${
            darkMode
              ? "bg-gradient-to-br from-saffron to-saffron-light hover:shadow-neon-saffron"
              : "bg-gradient-to-br from-saffron to-saffron-dark hover:shadow-lg"
          }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Toggle study assistant chat"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.svg
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              className="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </motion.svg>
          ) : (
            <motion.svg
              key="chat"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </motion.svg>
          )}
        </AnimatePresence>

        {/* Pulse ring when closed */}
        {!isOpen && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-saffron/40"
            animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.button>

      {/* ─── Chat Panel ─── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`fixed bottom-24 right-6 z-[999] w-[360px] max-w-[calc(100vw-48px)]
              rounded-2xl shadow-2xl overflow-hidden flex flex-col
              ${
                darkMode
                  ? "bg-navy border border-white/10"
                  : "bg-white border border-gray-200"
              }`}
            style={{ height: "min(500px, calc(100vh - 160px))" }}
          >
            {/* Header */}
            <div
              className="px-5 py-4 flex items-center gap-3 border-b
                bg-gradient-to-r from-saffron/10 to-transparent
                border-saffron/10"
            >
              <div
                className="w-9 h-9 rounded-full bg-gradient-to-br from-saffron to-gold
                  flex items-center justify-center flex-shrink-0"
              >
                <span className="text-xs font-bold text-navy">BK</span>
              </div>
              <div>
                <h4
                  className={`text-sm font-heading font-bold ${
                    darkMode ? "text-white" : "text-navy"
                  }`}
                >
                  Study Assistant
                </h4>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] text-gray-400">
                    Always online
                  </span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 scroll-smooth">
              {messages.map((msg, i) => (
                <ChatBubble key={i} message={msg} darkMode={darkMode} />
              ))}
              {isTyping && <TypingIndicator darkMode={darkMode} />}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            {messages.length <= 2 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {quickPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(prompt)}
                    className={`text-[11px] px-3 py-1.5 rounded-full font-medium transition-all
                      ${
                        darkMode
                          ? "bg-saffron/10 text-saffron-light hover:bg-saffron/20 border border-saffron/20"
                          : "bg-saffron/10 text-saffron-dark hover:bg-saffron/20 border border-saffron/25"
                      }`}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div
              className={`px-4 py-3 border-t ${
                darkMode
                  ? "border-white/10 bg-navy-light/50"
                  : "border-gray-100 bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about BPSC, skills, projects..."
                  className={`flex-1 text-sm px-4 py-2.5 rounded-full outline-none transition-all
                    ${
                      darkMode
                        ? "bg-navy-lighter/80 text-white placeholder-gray-500 border border-white/10 focus:border-saffron/40"
                        : "bg-white text-navy placeholder-gray-400 border border-gray-200 focus:border-saffron/50"
                    }`}
                />
                <motion.button
                  onClick={() => handleSend()}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  disabled={!input.trim()}
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                    transition-all duration-200
                    ${
                      input.trim()
                        ? "bg-gradient-to-br from-saffron to-saffron-light text-white shadow-md"
                        : darkMode
                          ? "bg-navy-lighter text-gray-600"
                          : "bg-gray-200 text-gray-400"
                    }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 19V5m0 0l-7 7m7-7l7 7"
                    />
                  </svg>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatWidget;
