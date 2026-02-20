import React, { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import {
  FaBook,
  FaGraduationCap,
  FaChalkboardTeacher,
  FaAward,
  FaMapMarkerAlt,
  FaHeart,
} from "react-icons/fa";
import { HiLightningBolt } from "react-icons/hi";
import OdometerCounter from "../ui/OdometerCounter";
import AnimatedCounter from "../ui/AnimatedCounter";

const milestones = [
  {
    year: "2020–21",
    title: "Academic Foundation",
    description:
      "Completed intermediate education in Bihar. Developed a deep passion for Indian history, polity, and public administration.",
    icon: <FaBook />,
  },
  {
    year: "2022–23",
    title: "BPSC Preparation Begins",
    description:
      "Started rigorous BPSC preparation — mastering General Studies, CSAT, and Bihar-specific topics with dedication.",
    icon: <FaGraduationCap />,
  },
  {
    year: "2024",
    title: "B.Ed Journey",
    description:
      "Enrolled in B.Ed program to become a qualified educator. Balancing teaching pedagogy with civil service prep.",
    icon: <FaChalkboardTeacher />,
  },
  {
    year: "2025–26",
    title: "Aspiration in Action",
    description:
      "Actively preparing for BPSC while completing B.Ed. Driven by the dream to serve Bihar through education and governance.",
    icon: <FaAward />,
  },
];

const TimelineCard = ({ milestone, index }) => {
  const { darkMode } = useTheme();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const isLeft = index % 2 === 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: isLeft ? -60 : 60 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.15, ease: "easeOut" }}
      className={`flex items-center mb-8 md:mb-16 ${
        isLeft ? "md:flex-row" : "md:flex-row-reverse"
      } flex-col md:flex-row`}
    >
      {/* Card */}
      <div
        className={`w-full md:w-5/12 ${isLeft ? "md:text-right md:pr-8" : "md:text-left md:pl-8"}`}
      >
        <motion.div
          whileHover={{ scale: 1.03, y: -5 }}
          className={`p-4 md:p-6 rounded-2xl md:rounded-2xl transition-all duration-300 ${
            darkMode
              ? "glass hover:shadow-glass-warm"
              : "glass-light hover:shadow-lg"
          }`}
        >
          <span
            className={`inline-block text-sm font-heading font-bold tracking-wider mb-2 ${
              darkMode ? "text-saffron" : "text-saffron-dark"
            }`}
          >
            {milestone.year}
          </span>
          <h3
            className={`text-xl font-heading font-bold mb-2 ${
              darkMode ? "text-white" : "text-navy"
            }`}
          >
            {milestone.title}
          </h3>
          <p
            className={`text-sm font-body leading-relaxed ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {milestone.description}
          </p>
        </motion.div>
      </div>

      {/* Center dot */}
      <div className="hidden md:flex w-2/12 justify-center">
        <motion.div
          whileHover={{ scale: 1.3 }}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-lg
            ${
              darkMode
                ? "bg-navy-lighter border-2 border-saffron text-saffron shadow-neon-saffron"
                : "bg-white border-2 border-saffron-dark text-saffron-dark shadow-lg"
            }`}
        >
          {milestone.icon}
        </motion.div>
      </div>

      {/* Empty space on other side */}
      <div className="hidden md:block w-5/12" />
    </motion.div>
  );
};

/* ─── Education Arc-Gauge Cards ─── */
const educationData = [
  {
    label: "Matriculation",
    pct: 57,
    year: "2017",
    color: "#FF9933",
    icon: "📚",
    board: "BSEB",
    bgImg: "/images.jpg",
  },
  {
    label: "Intermediate",
    pct: 61,
    year: "2017–19",
    color: "#FFD700",
    icon: "📖",
    board: "BSEB",
    bgImg: "/images.jpg",
  },
  {
    label: "Graduation",
    pct: 66,
    year: "2019–22",
    color: "#F4A261",
    icon: "🎓",
    board: "LNMU",
    bgImg:
      "/Lalit-Narayan-Mithila-University-in-Darbhanga---HT_1682006882370.webp",
  },
  {
    label: "B.Ed",
    pct: null,
    year: "2024–26",
    color: "#4ECCA3",
    icon: "🏫",
    board: "LNMU",
    bgImg:
      "/Lalit-Narayan-Mithila-University-in-Darbhanga---HT_1682006882370.webp",
  },
];

const EducationArcGauges = ({ darkMode }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const RADIUS = 42;
  const circumf = 2 * Math.PI * RADIUS;

  return (
    <div
      ref={ref}
      className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-14"
    >
      {educationData.map((edu, i) => {
        const filled = edu.pct ? (edu.pct / 100) * circumf : 0;
        const gap = circumf - filled;

        return (
          <motion.div
            key={edu.label}
            initial={{ opacity: 0, y: 40, scale: 0.85 }}
            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{
              type: "spring",
              stiffness: 120,
              damping: 16,
              delay: i * 0.15,
            }}
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -6 }}
              className={`relative rounded-3xl p-5 md:p-6 flex flex-col items-center text-center overflow-hidden border
                ${
                  darkMode
                    ? "bg-white/[0.04] border-white/[0.08] hover:border-white/[0.15]"
                    : "bg-white/70 border-gray-200/60 hover:border-saffron/30"
                }
                backdrop-blur-xl transition-colors duration-300`}
              style={{
                boxShadow: darkMode
                  ? `0 16px 48px -12px rgba(0,0,0,0.4), 0 0 24px ${edu.color}08`
                  : `0 8px 32px -8px rgba(0,0,0,0.08), 0 0 16px ${edu.color}08`,
              }}
            >
              {/* Faded institution background image */}
              <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                <img
                  src={edu.bgImg}
                  alt={edu.board}
                  className="absolute inset-0 w-full h-full object-contain p-3"
                  style={{
                    opacity: darkMode ? 0.3 : 0.35,
                    filter: "grayscale(30%)",
                  }}
                  draggable="false"
                />
                {/* Gradient overlay on image */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: darkMode
                      ? `linear-gradient(180deg, transparent 0%, rgba(10,25,47,0.2) 40%, rgba(10,25,47,0.75) 100%)`
                      : `linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.25) 40%, rgba(255,255,255,0.75) 100%)`,
                  }}
                />
              </div>

              {/* Subtle top gradient accent */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px] rounded-t-3xl z-[1]"
                style={{
                  background: `linear-gradient(90deg, transparent, ${edu.color}, transparent)`,
                  opacity: 0.6,
                }}
              />

              {/* SVG Arc Gauge */}
              <div className="relative w-20 h-20 md:w-24 md:h-24 mb-3 z-[2]">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {/* Background track */}
                  <circle
                    cx="50"
                    cy="50"
                    r={RADIUS}
                    fill="none"
                    stroke={
                      darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"
                    }
                    strokeWidth="6"
                  />
                  {/* Filled arc */}
                  {edu.pct && (
                    <motion.circle
                      cx="50"
                      cy="50"
                      r={RADIUS}
                      fill="none"
                      stroke={edu.color}
                      strokeWidth="6"
                      strokeLinecap="round"
                      initial={{ strokeDasharray: `0 ${circumf}` }}
                      animate={
                        isInView ? { strokeDasharray: `${filled} ${gap}` } : {}
                      }
                      transition={{
                        duration: 1.8,
                        delay: 0.4 + i * 0.2,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      style={{
                        filter: `drop-shadow(0 0 8px ${edu.color}60)`,
                      }}
                    />
                  )}
                  {/* Ongoing spinner for B.Ed */}
                  {!edu.pct && (
                    <motion.circle
                      cx="50"
                      cy="50"
                      r={RADIUS}
                      fill="none"
                      stroke={edu.color}
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${circumf * 0.3} ${circumf * 0.7}`}
                      animate={{ strokeDashoffset: [0, -circumf] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      style={{ filter: `drop-shadow(0 0 8px ${edu.color}60)` }}
                    />
                  )}
                </svg>
                {/* Center percentage */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {edu.pct ? (
                    <motion.span
                      className="font-heading font-black text-lg md:text-xl"
                      style={{ color: edu.color }}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={isInView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ duration: 0.5, delay: 0.8 + i * 0.2 }}
                    >
                      {edu.pct}%
                    </motion.span>
                  ) : (
                    <motion.span
                      className="text-xl"
                      animate={{ rotate: [0, 360] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      style={{ color: edu.color }}
                    >
                      ⟳
                    </motion.span>
                  )}
                </div>
              </div>

              {/* Label */}
              <h4
                className={`text-xs md:text-sm font-heading font-bold tracking-[0.06em] uppercase mb-0.5 z-[2]
                  ${darkMode ? "text-white" : "text-navy"}`}
              >
                {edu.label}
              </h4>
              <p
                className={`text-[10px] font-heading font-semibold tracking-wider uppercase z-[2]
                ${darkMode ? "text-gray-500" : "text-gray-400"}`}
                style={{ color: `${edu.color}90` }}
              >
                {edu.board}
              </p>
              <p
                className={`text-[11px] font-body mt-0.5 z-[2] ${darkMode ? "text-gray-400" : "text-gray-500"}`}
              >
                {edu.year}
                {!edu.pct && (
                  <span
                    className="ml-1 font-medium"
                    style={{ color: edu.color }}
                  >
                    (Ongoing)
                  </span>
                )}
              </p>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
};

/* ─── Timeline with Scroll-Linked Progress Line ─── */
const TimelineWithProgress = ({ milestones, darkMode }) => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 80%", "end 40%"],
  });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div ref={containerRef} className="relative">
      {/* Background track */}
      <div
        className={`hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 ${
          darkMode ? "bg-white/5" : "bg-gray-200"
        }`}
      />
      {/* Animated saffron fill */}
      <motion.div
        className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 w-1 rounded-full origin-top z-[1]"
        style={{
          height: lineHeight,
          background: darkMode
            ? "linear-gradient(180deg, #FF9933, #F4A261, #FFD700)"
            : "linear-gradient(180deg, #E88A1A, #FF9933, #F4A261)",
          boxShadow: "0 0 8px rgba(255, 153, 51, 0.4)",
        }}
      />

      {milestones.map((milestone, index) => (
        <TimelineCard key={index} milestone={milestone} index={index} />
      ))}
    </div>
  );
};

const About = () => {
  const { darkMode } = useTheme();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section id="about" className="section-padding relative">
      <div ref={sectionRef} className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-20"
        >
          <h2
            className={`text-3xl md:text-5xl font-heading font-bold mb-4 ${
              darkMode ? "text-white" : "text-navy"
            }`}
          >
            About <span className="gradient-text">Me</span>
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-saffron to-saffron-light mx-auto rounded-full" />
        </motion.div>

        {/* ═══════ BENTO GRID LAYOUT ═══════ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 md:grid-rows-3 gap-3 md:gap-4 mb-20 auto-rows-auto md:auto-rows-fr"
        >
          {/* ── Cell 1: Hero Profile (spans 2 cols, 2 rows) ── */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className={`col-span-2 md:col-span-2 md:row-span-2 rounded-3xl p-6 md:p-8 flex flex-col justify-between overflow-hidden relative group
              ${darkMode ? "glass hover:shadow-glass-warm" : "glass-light hover:shadow-lg"}`}
          >
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <motion.div
                  whileHover={{ rotateY: 10, rotateX: -10 }}
                  className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden flex-shrink-0
                    ${darkMode ? "shadow-neon-saffron" : "shadow-xl"}`}
                  style={{ perspective: "1000px" }}
                >
                  <img
                    src="/image.png"
                    alt="Bipin Kumar"
                    className="w-full h-full object-cover object-center"
                    draggable="false"
                  />
                </motion.div>
                <div>
                  <h3
                    className={`text-xl md:text-2xl font-heading font-bold ${darkMode ? "text-white" : "text-navy"}`}
                  >
                    Bipin Kumar
                  </h3>
                  <p
                    className={`text-sm ${darkMode ? "text-saffron-light" : "text-saffron-dark"}`}
                  >
                    BPSC Aspirant & Future Educator
                  </p>
                </div>
              </div>
              <p
                className={`text-sm leading-relaxed mb-4 ${darkMode ? "text-gray-300" : "text-gray-600"}`}
              >
                I'm a dedicated BPSC aspirant and B.Ed student from Bihar,
                India. My journey is fueled by a deep commitment to education
                and public service — two pillars that can transform communities
                and uplift society.
              </p>
              <p
                className={`text-sm leading-relaxed ${darkMode ? "text-gray-400" : "text-gray-500"}`}
              >
                From the historic lands of Bihar, I draw inspiration from the
                legacy of Chanakya, Aryabhata, and the Nalanda tradition.
              </p>
            </div>
            {/* Decorative corner glow */}
            <div
              className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-saffron/5 blur-3xl
              group-hover:bg-saffron/10 transition-colors duration-700"
            />
          </motion.div>

          {/* ── Cell 2: Study Hours (animated counter) ── */}
          <motion.div
            whileHover={{ scale: 1.03, y: -4 }}
            className={`rounded-3xl p-4 md:p-6 flex flex-col items-center justify-center text-center relative overflow-hidden
              ${darkMode ? "glass hover:shadow-glass-warm" : "glass-light hover:shadow-lg"}`}
          >
            <HiLightningBolt
              className={`text-2xl md:text-3xl mb-1 md:mb-2 ${darkMode ? "text-saffron" : "text-saffron-dark"}`}
            />
            <OdometerCounter
              value={500}
              suffix="+"
              duration={2.5}
              className="text-2xl md:text-4xl font-heading font-bold"
              digitClassName="gradient-text"
            />
            <span
              className={`text-[10px] md:text-xs font-body mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              Study Hours
            </span>
          </motion.div>

          {/* ── Cell 3: B.Ed Status ── */}
          <motion.div
            whileHover={{ scale: 1.03, y: -4 }}
            className={`rounded-3xl p-4 md:p-6 flex flex-col items-center justify-center text-center
              ${darkMode ? "glass hover:shadow-glass-warm" : "glass-light hover:shadow-lg"}`}
          >
            <FaGraduationCap
              className={`text-2xl md:text-3xl mb-1 md:mb-2 ${darkMode ? "text-emerald-400" : "text-emerald-600"}`}
            />
            <span className="text-xl md:text-3xl font-heading font-bold gradient-text">
              B.Ed
            </span>
            <span
              className={`text-[10px] md:text-xs font-body mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              In Progress
            </span>
          </motion.div>

          {/* ── Cell 4: Location Badge ── */}
          <motion.div
            whileHover={{ scale: 1.03, y: -4 }}
            className={`rounded-3xl p-4 md:p-6 flex flex-col items-center justify-center text-center relative overflow-hidden
              ${darkMode ? "glass hover:shadow-glass-warm" : "glass-light hover:shadow-lg"}`}
          >
            <FaMapMarkerAlt
              className={`text-xl md:text-2xl mb-1 md:mb-2 ${darkMode ? "text-gold" : "text-saffron-dark"}`}
            />
            <span
              className={`text-base md:text-lg font-heading font-bold ${darkMode ? "text-white" : "text-navy"}`}
            >
              Bihar, India
            </span>
            <span
              className={`text-[10px] md:text-xs font-body mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              Land of Nalanda
            </span>
          </motion.div>

          {/* ── Cell 5: Tagline / Quote (spans 2 cols) ── */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className={`col-span-2 rounded-3xl p-4 md:p-6 flex items-center justify-center relative overflow-hidden
              bg-gradient-to-r from-saffron/10 via-gold/5 to-saffron-light/10
              ${darkMode ? "border border-saffron/10" : "border border-saffron/15"}`}
          >
            <div className="text-center">
              <p
                className={`text-lg md:text-xl font-serif italic ${darkMode ? "text-gray-200" : "text-navy"}`}
              >
                "From{" "}
                <span className="text-saffron font-semibold not-italic">
                  Student
                </span>{" "}
                to{" "}
                <span className="gradient-text font-semibold not-italic">
                  Civil Servant
                </span>{" "}
                — One Step at a Time"
              </p>
            </div>
          </motion.div>

          {/* ── Cell 6: BPSC Target ── */}
          <motion.div
            whileHover={{ scale: 1.03, y: -4 }}
            className={`rounded-3xl p-4 md:p-6 flex flex-col items-center justify-center text-center
              ${darkMode ? "glass hover:shadow-glass-warm" : "glass-light hover:shadow-lg"}`}
          >
            <FaAward
              className={`text-2xl md:text-3xl mb-1 md:mb-2 ${darkMode ? "text-saffron" : "text-saffron-dark"}`}
            />
            <span className="text-xl md:text-3xl font-heading font-bold gradient-text">
              BPSC
            </span>
            <span
              className={`text-[10px] md:text-xs font-body mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              Target Exam
            </span>
          </motion.div>

          {/* ── Cell 7: Passion ── */}
          <motion.div
            whileHover={{ scale: 1.03, y: -4 }}
            className={`rounded-3xl p-4 md:p-6 flex flex-col items-center justify-center text-center
              ${darkMode ? "glass hover:shadow-glass-warm" : "glass-light hover:shadow-lg"}`}
          >
            <FaHeart
              className={`text-xl md:text-2xl mb-1 md:mb-2 ${darkMode ? "text-rose-400" : "text-rose-500"}`}
            />
            <span
              className={`text-xs md:text-sm font-heading font-bold ${darkMode ? "text-white" : "text-navy"}`}
            >
              Education & Service
            </span>
            <span
              className={`text-[10px] md:text-xs font-body mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              My Passion
            </span>
          </motion.div>
        </motion.div>

        {/* ═══════ ANIMATED STATS STRIP ═══════ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-20 p-4 md:p-8 rounded-3xl
            ${
              darkMode
                ? "glass border border-white/[0.06]"
                : "glass-light border border-gray-200/60"
            }`}
        >
          <AnimatedCounter
            end={500}
            suffix="+"
            label="Study Hours"
            duration={2200}
            icon={<HiLightningBolt className="text-2xl" />}
          />
          <AnimatedCounter
            end={50}
            suffix="+"
            label="Mock Tests"
            duration={1800}
            icon={<FaBook className="text-2xl" />}
          />
          <AnimatedCounter
            end={12}
            suffix="+"
            label="Subjects Covered"
            duration={1500}
            icon={<FaGraduationCap className="text-2xl" />}
          />
          <AnimatedCounter
            end={365}
            suffix="+"
            label="Days of Prep"
            duration={2500}
            icon={<FaChalkboardTeacher className="text-2xl" />}
          />
        </motion.div>

        {/* Timeline */}
        <div>
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={`text-2xl md:text-3xl font-heading font-bold text-center mb-12 ${
              darkMode ? "text-white" : "text-navy"
            }`}
          >
            My <span className="gradient-text">Journey</span>
          </motion.h3>

          {/* Education Arc-Gauge Cards */}
          <EducationArcGauges darkMode={darkMode} />

          {/* Timeline with Scroll-Linked Progress Line */}
          <TimelineWithProgress milestones={milestones} darkMode={darkMode} />
        </div>
      </div>
    </section>
  );
};

export default About;
