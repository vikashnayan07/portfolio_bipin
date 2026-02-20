import React, { useRef, useState, useCallback, useMemo } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import {
  FaGavel,
  FaGlobe,
  FaLandmark,
  FaCalculator,
  FaLanguage,
  FaChalkboardTeacher,
  FaChild,
  FaBrain,
  FaPenFancy,
  FaUsers,
  FaClock,
  FaLightbulb,
  FaMicrophone,
  FaMapMarkedAlt,
  FaBalanceScale,
} from "react-icons/fa";
import { HiAcademicCap, HiBookOpen, HiUserGroup } from "react-icons/hi";

/* ─── Skill Data ─── */
const skillCategories = [
  {
    title: "BPSC — General Studies",
    subtitle: "Prelims & Mains Core Subjects",
    icon: <HiAcademicCap className="text-xl" />,
    color: "saffron",
    skills: [
      { name: "Indian History", level: 90, icon: <FaLandmark /> },
      { name: "Indian Polity & Constitution", level: 85, icon: <FaGavel /> },
      { name: "Geography", level: 80, icon: <FaGlobe /> },
      { name: "Indian Economy", level: 75, icon: <FaCalculator /> },
      { name: "General Science", level: 70, icon: <FaLightbulb /> },
      {
        name: "Bihar GK & Current Affairs",
        level: 88,
        icon: <FaMapMarkedAlt />,
      },
    ],
  },
  {
    title: "B.Ed — Teaching Skills",
    subtitle: "Pedagogy & Classroom Expertise",
    icon: <HiBookOpen className="text-xl" />,
    color: "emerald",
    skills: [
      { name: "Teaching Pedagogy", level: 85, icon: <FaChalkboardTeacher /> },
      { name: "Child Psychology", level: 78, icon: <FaChild /> },
      { name: "Lesson Plan Design", level: 82, icon: <FaPenFancy /> },
      { name: "Classroom Management", level: 80, icon: <FaUsers /> },
      { name: "Educational Psychology", level: 75, icon: <FaBrain /> },
      { name: "Hindi & English Proficiency", level: 88, icon: <FaLanguage /> },
    ],
  },
  {
    title: "Soft Skills & Leadership",
    subtitle: "Personal Development",
    icon: <HiUserGroup className="text-xl" />,
    color: "blue",
    skills: [
      { name: "Public Speaking", level: 72, icon: <FaMicrophone /> },
      { name: "Time Management", level: 85, icon: <FaClock /> },
      { name: "Critical Thinking", level: 80, icon: <FaBrain /> },
      { name: "Essay & Answer Writing", level: 88, icon: <FaPenFancy /> },
      { name: "Ethics & Integrity", level: 92, icon: <FaBalanceScale /> },
      { name: "Group Discussion", level: 75, icon: <FaUsers /> },
    ],
  },
];

/* ─── Color Maps ─── */
const colorMap = {
  saffron: {
    gradient: "from-saffron to-saffron-light",
    text: "text-saffron",
    textDark: "text-saffron-dark",
    border: "border-saffron/30",
    bar: "bg-gradient-to-r from-saffron to-saffron-light",
  },
  emerald: {
    gradient: "from-emerald-500 to-teal-400",
    text: "text-emerald-400",
    textDark: "text-emerald-600",
    border: "border-emerald-500/30",
    bar: "bg-gradient-to-r from-emerald-500 to-teal-400",
  },
  blue: {
    gradient: "from-blue-500 to-cyan-400",
    text: "text-blue-400",
    textDark: "text-blue-600",
    border: "border-blue-500/30",
    bar: "bg-gradient-to-r from-blue-500 to-cyan-400",
  },
};

/* ─── Animated Skill Bar ─── */
const SkillBar = ({ skill, index, isInView, color }) => {
  const { darkMode } = useTheme();
  const colors = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="mb-4 last:mb-0"
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span
            className={`text-sm ${darkMode ? colors.text : colors.textDark}`}
          >
            {skill.icon}
          </span>
          <span
            className={`text-sm font-body font-medium ${
              darkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {skill.name}
          </span>
        </div>
        <span
          className={`text-xs font-heading font-bold ${
            darkMode ? colors.text : colors.textDark
          }`}
        >
          {skill.level}%
        </span>
      </div>
      <div
        className={`h-2 rounded-full overflow-hidden ${
          darkMode ? "bg-navy-lighter" : "bg-gray-200"
        }`}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={isInView ? { width: `${skill.level}%` } : { width: 0 }}
          transition={{
            duration: 1.2,
            delay: 0.3 + index * 0.08,
            ease: "easeOut",
          }}
          className={`h-full rounded-full ${colors.bar}`}
        />
      </div>
    </motion.div>
  );
};

/* ─── Skill Category Card ─── */
const SkillCategoryCard = ({ category, index }) => {
  const { darkMode } = useTheme();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const colors = colorMap[category.color];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15 }}
    >
      <motion.div
        whileHover={{ y: -5 }}
        transition={{ type: "spring", stiffness: 300 }}
        className={`h-full rounded-2xl overflow-hidden transition-all duration-500 ${
          darkMode ? "glass" : "glass-light"
        }`}
      >
        {/* Card Header */}
        <div
          className={`p-4 md:p-6 pb-3 md:pb-4 border-b ${
            darkMode ? "border-white/5" : "border-gray-100"
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center
              bg-gradient-to-r ${colors.gradient} text-white`}
            >
              {category.icon}
            </div>
            <div>
              <h3
                className={`text-lg font-heading font-bold ${
                  darkMode ? "text-white" : "text-navy"
                }`}
              >
                {category.title}
              </h3>
              <p
                className={`text-xs font-body ${
                  darkMode ? "text-gray-500" : "text-gray-400"
                }`}
              >
                {category.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="p-4 md:p-6 pt-3 md:pt-4">
          {category.skills.map((skill, i) => (
            <SkillBar
              key={skill.name}
              skill={skill}
              index={i}
              isInView={isInView}
              color={category.color}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ─── Animated Radar Chart — Premium SVG Visualization ─── */
const SkillRadarChart = () => {
  const { darkMode } = useTheme();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const focusAreas = useMemo(
    () => [
      {
        label: "History",
        level: 0.9,
        emoji: "📜",
        desc: "Ancient to Modern India",
        accent: "#FF9933",
      },
      {
        label: "Polity",
        level: 0.85,
        emoji: "⚖️",
        desc: "Constitution & Governance",
        accent: "#FFD700",
      },
      {
        label: "Geography",
        level: 0.8,
        emoji: "🌏",
        desc: "Physical & Human Geo",
        accent: "#34D399",
      },
      {
        label: "Economy",
        level: 0.75,
        emoji: "📊",
        desc: "Macro & Micro Economics",
        accent: "#60A5FA",
      },
      {
        label: "Pedagogy",
        level: 0.85,
        emoji: "📖",
        desc: "Teaching Methodology",
        accent: "#A78BFA",
      },
      {
        label: "Ethics",
        level: 0.92,
        emoji: "🕊️",
        desc: "Values & Integrity",
        accent: "#F472B6",
      },
    ],
    [],
  );

  const cx = 200,
    cy = 200,
    R = 140;
  const N = focusAreas.length;

  /* Compute vertex position on hexagonal grid */
  const getPoint = useCallback(
    (i, ratio = 1) => {
      const angle = (Math.PI * 2 * i) / N - Math.PI / 2;
      return {
        x: cx + Math.cos(angle) * R * ratio,
        y: cy + Math.sin(angle) * R * ratio,
      };
    },
    [N],
  );

  /* Build polygon path string */
  const buildPolygon = useCallback(
    (ratioFn) => {
      return Array.from({ length: N }, (_, i) => {
        const ratio = typeof ratioFn === "function" ? ratioFn(i) : ratioFn;
        const p = getPoint(i, ratio);
        return `${p.x},${p.y}`;
      }).join(" ");
    },
    [N, getPoint],
  );

  /* Concentric grid rings */
  const gridRings = [0.25, 0.5, 0.75, 1.0];

  /* Axis lines from center to each vertex */
  const axes = Array.from({ length: N }, (_, i) => getPoint(i, 1));

  /* Data polygon */
  const dataPolygon = buildPolygon((i) => focusAreas[i].level);

  /* Hover detail */
  const hovered = hoveredIdx !== null ? focusAreas[hoveredIdx] : null;

  return (
    <div
      ref={ref}
      className="flex flex-col lg:flex-row items-center gap-8 max-w-4xl mx-auto my-10"
    >
      {/* ── SVG Radar Chart ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex-shrink-0"
      >
        <svg
          viewBox="0 0 400 400"
          className="w-72 h-72 sm:w-80 sm:h-80 md:w-[340px] md:h-[340px]"
          style={{
            filter: darkMode
              ? "drop-shadow(0 0 40px rgba(255,153,51,0.06))"
              : "none",
          }}
        >
          <defs>
            {/* Radial gradient for the data polygon fill */}
            <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FF9933" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#FF9933" stopOpacity="0.05" />
            </radialGradient>
            {/* Glow filter for nodes */}
            <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Pulse glow filter */}
            <filter
              id="pulseGlow"
              x="-100%"
              y="-100%"
              width="300%"
              height="300%"
            >
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ─ Grid rings (hexagonal) ─ */}
          {gridRings.map((ratio, ri) => (
            <motion.polygon
              key={`ring-${ri}`}
              points={buildPolygon(ratio)}
              fill="none"
              stroke={
                darkMode ? "rgba(255,153,51,0.08)" : "rgba(255,153,51,0.12)"
              }
              strokeWidth={ratio === 1 ? 1.2 : 0.6}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.1 + ri * 0.08 }}
              style={{ transformOrigin: `${cx}px ${cy}px` }}
            />
          ))}

          {/* ─ Grid ring labels ─ */}
          {gridRings.map((ratio, ri) => {
            const labelPt = getPoint(0, ratio);
            return (
              <text
                key={`label-${ri}`}
                x={labelPt.x + 4}
                y={labelPt.y - 4}
                fill={darkMode ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)"}
                fontSize="8"
                fontFamily="Inter, sans-serif"
              >
                {Math.round(ratio * 100)}%
              </text>
            );
          })}

          {/* ─ Axis lines ─ */}
          {axes.map((pt, i) => (
            <motion.line
              key={`axis-${i}`}
              x1={cx}
              y1={cy}
              x2={pt.x}
              y2={pt.y}
              stroke={
                darkMode ? "rgba(255,153,51,0.06)" : "rgba(255,153,51,0.10)"
              }
              strokeWidth={0.6}
              strokeDasharray="4 4"
              initial={{ pathLength: 0 }}
              animate={isInView ? { pathLength: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.2 + i * 0.06 }}
            />
          ))}

          {/* ─ Data polygon (filled area) ─ */}
          <motion.polygon
            points={dataPolygon}
            fill="url(#radarFill)"
            stroke="#FF9933"
            strokeWidth={1.5}
            strokeLinejoin="round"
            initial={{ opacity: 0, scale: 0.3 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />

          {/* ─ Animated pulse on data polygon border ─ */}
          <motion.polygon
            points={dataPolygon}
            fill="none"
            stroke="#FF9933"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeOpacity={0.3}
            filter="url(#pulseGlow)"
            animate={{ strokeOpacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />

          {/* ─ Data nodes (interactive) ─ */}
          {focusAreas.map((area, i) => {
            const pt = getPoint(i, area.level);
            const isHovered = hoveredIdx === i;
            return (
              <g key={`node-${i}`}>
                {/* Hover ring */}
                {isHovered && (
                  <motion.circle
                    cx={pt.x}
                    cy={pt.y}
                    r={14}
                    fill={`${area.accent}10`}
                    stroke={area.accent}
                    strokeWidth={0.8}
                    initial={{ r: 6, opacity: 0 }}
                    animate={{ r: 14, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
                {/* Outer glow circle */}
                <motion.circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 7 : 5}
                  fill={area.accent}
                  opacity={0.2}
                  filter="url(#nodeGlow)"
                  initial={{ r: 0 }}
                  animate={isInView ? { r: isHovered ? 7 : 5 } : {}}
                  transition={{ duration: 0.5, delay: 0.6 + i * 0.08 }}
                />
                {/* Core dot */}
                <motion.circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 5 : 3.5}
                  fill={area.accent}
                  stroke={darkMode ? "#0A192F" : "#ffffff"}
                  strokeWidth={1.5}
                  initial={{ r: 0 }}
                  animate={isInView ? { r: isHovered ? 5 : 3.5 } : {}}
                  transition={{
                    duration: 0.4,
                    delay: 0.6 + i * 0.08,
                    type: "spring",
                    stiffness: 300,
                  }}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              </g>
            );
          })}

          {/* ─ Labels around the chart ─ */}
          {focusAreas.map((area, i) => {
            const labelPt = getPoint(i, 1.22);
            const isHovered = hoveredIdx === i;

            return (
              <g
                key={`lbl-${i}`}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <text
                  x={labelPt.x}
                  y={labelPt.y - 8}
                  textAnchor="middle"
                  fill={
                    isHovered
                      ? area.accent
                      : darkMode
                        ? "rgba(255,255,255,0.5)"
                        : "rgba(0,0,0,0.45)"
                  }
                  fontSize={isHovered ? "12" : "11"}
                  fontFamily="Poppins, sans-serif"
                  fontWeight={isHovered ? "700" : "600"}
                  style={{ transition: "all 200ms ease" }}
                >
                  {area.emoji} {area.label}
                </text>
                <text
                  x={labelPt.x}
                  y={labelPt.y + 6}
                  textAnchor="middle"
                  fill={
                    isHovered
                      ? area.accent
                      : darkMode
                        ? "rgba(255,255,255,0.25)"
                        : "rgba(0,0,0,0.25)"
                  }
                  fontSize="8"
                  fontFamily="Inter, sans-serif"
                  fontWeight="700"
                  style={{ transition: "all 200ms ease" }}
                >
                  {Math.round(area.level * 100)}%
                </text>
              </g>
            );
          })}

          {/* ─ Center emblem ─ */}
          <motion.circle
            cx={cx}
            cy={cy}
            r={22}
            fill={darkMode ? "rgba(10,25,47,0.9)" : "rgba(255,255,255,0.95)"}
            stroke="rgba(255,153,51,0.3)"
            strokeWidth={1.5}
            initial={{ r: 0 }}
            animate={isInView ? { r: 22 } : {}}
            transition={{ duration: 0.6, delay: 0.8, type: "spring" }}
          />
          <motion.text
            x={cx}
            y={cy + 1}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#FF9933"
            fontSize="14"
            fontFamily="Poppins, sans-serif"
            fontWeight="800"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 1 }}
          >
            BK
          </motion.text>
          {/* Rotating ring around center */}
          <motion.circle
            cx={cx}
            cy={cy}
            r={26}
            fill="none"
            stroke="rgba(255,153,51,0.15)"
            strokeWidth={0.8}
            strokeDasharray="8 6"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />
        </svg>
      </motion.div>

      {/* ── Hover Detail Panel ── */}
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          {hovered ? (
            <motion.div
              key={hovered.label}
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -10, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className={`p-6 rounded-2xl backdrop-blur-sm relative overflow-hidden
                ${
                  darkMode
                    ? "bg-white/[0.04] border border-white/[0.08]"
                    : "bg-white/80 border border-gray-200/80 shadow-lg"
                }`}
            >
              {/* Accent top bar */}
              <div
                className="absolute top-0 left-0 w-full h-[2px]"
                style={{
                  background: `linear-gradient(90deg, ${hovered.accent}, ${hovered.accent}40, transparent)`,
                }}
              />
              {/* Accent corner glow */}
              <div
                className="absolute -top-10 -right-10 w-32 h-32 rounded-full pointer-events-none"
                style={{
                  background: `radial-gradient(circle, ${hovered.accent}15 0%, transparent 70%)`,
                  filter: "blur(15px)",
                }}
              />

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{
                      background: `${hovered.accent}15`,
                      boxShadow: `0 0 20px ${hovered.accent}15`,
                    }}
                  >
                    {hovered.emoji}
                  </div>
                  <div>
                    <h4
                      className={`text-lg font-heading font-bold ${darkMode ? "text-white" : "text-navy"}`}
                    >
                      {hovered.label}
                    </h4>
                    <p
                      className={`text-xs font-body ${darkMode ? "text-gray-500" : "text-gray-400"}`}
                    >
                      {hovered.desc}
                    </p>
                  </div>
                </div>

                {/* Animated arc gauge */}
                <div className="flex items-center gap-4">
                  <svg viewBox="0 0 80 44" className="w-20 h-11 flex-shrink-0">
                    {/* Background arc */}
                    <path
                      d="M 8 40 A 32 32 0 0 1 72 40"
                      fill="none"
                      stroke={
                        darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"
                      }
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                    {/* Data arc — dasharray trick */}
                    <motion.path
                      d="M 8 40 A 32 32 0 0 1 72 40"
                      fill="none"
                      stroke={hovered.accent}
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeDasharray="100"
                      initial={{ strokeDashoffset: 100 }}
                      animate={{ strokeDashoffset: 100 - hovered.level * 100 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                    <text
                      x="40"
                      y="38"
                      textAnchor="middle"
                      fill={hovered.accent}
                      fontSize="13"
                      fontFamily="Poppins, sans-serif"
                      fontWeight="800"
                    >
                      {Math.round(hovered.level * 100)}%
                    </text>
                  </svg>
                  <div className="flex-1">
                    <div
                      className={`h-2 rounded-full overflow-hidden ${darkMode ? "bg-white/[0.06]" : "bg-gray-200"}`}
                    >
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background: `linear-gradient(90deg, ${hovered.accent}, ${hovered.accent}80)`,
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${hovered.level * 100}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                    </div>
                    <p
                      className={`text-[10px] font-body mt-1.5 ${darkMode ? "text-gray-600" : "text-gray-400"}`}
                    >
                      Proficiency Level
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`p-6 rounded-2xl text-center
                ${
                  darkMode
                    ? "bg-white/[0.02] border border-dashed border-white/[0.06]"
                    : "bg-gray-50/50 border border-dashed border-gray-200/60"
                }`}
            >
              <motion.p
                animate={{ opacity: [0.4, 0.7, 0.4] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className={`text-sm font-body ${darkMode ? "text-gray-600" : "text-gray-400"}`}
              >
                ← Hover on any node to explore
              </motion.p>
              {/* Mini summary chips */}
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {focusAreas.map((area, i) => (
                  <motion.button
                    key={area.label}
                    onMouseEnter={() => setHoveredIdx(i)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.8 + i * 0.06 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-body font-medium transition-all
                      ${
                        darkMode
                          ? "bg-white/[0.04] border border-white/[0.08] text-gray-400 hover:border-saffron/30 hover:text-saffron"
                          : "bg-white border border-gray-200 text-gray-500 hover:border-saffron/40 hover:text-saffron-dark"
                      }`}
                  >
                    {area.emoji} {area.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

/* ─── Main Skills Section ─── */
const Skills = () => {
  const { darkMode } = useTheme();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section id="skills" className="section-padding relative overflow-hidden">
      {/* Subtle pattern */}
      <div
        className={`absolute inset-0 opacity-[0.02] ${darkMode ? "block" : "hidden"}`}
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,153,51,0.5) 1px, transparent 0)",
          backgroundSize: "50px 50px",
        }}
      />

      <div ref={sectionRef} className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <h2
            className={`text-3xl md:text-5xl font-heading font-bold mb-4 ${
              darkMode ? "text-white" : "text-navy"
            }`}
          >
            Skills & <span className="gradient-text">Expertise</span>
          </h2>
          <p
            className={`text-base md:text-lg font-body max-w-2xl mx-auto mb-6 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            A well-rounded skillset combining academic knowledge, teaching
            capabilities, and leadership qualities — all geared toward serving
            Bihar.
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-saffron to-saffron-light mx-auto rounded-full" />
        </motion.div>

        {/* Interactive Radar Chart */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <SkillRadarChart />
        </motion.div>

        {/* Skill Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-6 md:mt-8">
          {skillCategories.map((category, index) => (
            <SkillCategoryCard
              key={category.title}
              category={category}
              index={index}
            />
          ))}
        </div>

        {/* Bottom Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-10 md:mt-16"
        >
          <blockquote
            className={`max-w-xl mx-auto px-6 py-4 rounded-2xl ${
              darkMode ? "glass" : "glass-light"
            }`}
          >
            <p
              className="text-sm md:text-base font-serif italic leading-relaxed mb-2"
              style={{ color: darkMode ? "#F4A261" : "#E88A1A" }}
            >
              "An investment in knowledge pays the best interest."
            </p>
            <cite
              className={`text-xs font-body not-italic ${
                darkMode ? "text-gray-500" : "text-gray-400"
              }`}
            >
              — Benjamin Franklin
            </cite>
          </blockquote>
        </motion.div>
      </div>
    </section>
  );
};

export default Skills;
