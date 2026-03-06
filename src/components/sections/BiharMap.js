import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import {
  motion,
  AnimatePresence,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import useProfile from "../../hooks/useProfile";
import { FaMapMarkerAlt, FaInfoCircle } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";

/* ═══════════════════════════════════════════════════════════════
   IMMERSIVE 3D BIHAR MAP — Real Geographic Boundaries (GADM)
   
   Features:
   • Geographically accurate 38-district Bihar map
   • CSS 3D perspective with mouse-reactive parallax tilt
   • Neon glow/bloom district effects
   • Animated radar pulse from Patna
   • Floating constellation particle background
   • Two-way sync: map ↔ sidebar cards
   • Glassmorphism cards with micro-animations
   • Stats counters + profile badge
═══════════════════════════════════════════════════════════════ */

const GEO_URL = "/bihar_districts.geojson";

/* District data mapped to real GeoJSON NAME_2 values */
const districts = [
  {
    id: "patna",
    geoName: "Patna",
    name: "Patna",
    coords: [85.14, 25.61],
    fact: "Capital city — Home to BPSC HQ & ancient Patliputra. Bipin's exam center!",
    emoji: "🏛️",
    color: "#FF9933",
    highlight: true,
    pop: "2.5M",
    area: "3,202 km²",
  },
  {
    id: "gaya",
    geoName: "Gaya",
    name: "Gaya",
    coords: [85.0, 24.8],
    fact: "Bodh Gaya — Where Buddha attained enlightenment. UNESCO World Heritage site.",
    emoji: "🙏",
    color: "#FFD700",
    pop: "4.4M",
    area: "4,976 km²",
  },
  {
    id: "nalanda",
    geoName: "Nalanda",
    name: "Nalanda",
    coords: [85.45, 25.12],
    fact: "Ancient Nalanda University — World's first residential university (5th century CE)!",
    emoji: "📚",
    color: "#F4A261",
    pop: "2.9M",
    area: "2,355 km²",
  },
  {
    id: "vaishali",
    geoName: "Vaishali",
    name: "Vaishali",
    coords: [85.33, 25.7],
    fact: "Birthplace of democracy — World's first republic (Licchavi). Lord Mahavir's birthplace.",
    emoji: "⚖️",
    color: "#E88A1A",
    pop: "3.5M",
    area: "2,036 km²",
  },
  {
    id: "muzaffarpur",
    geoName: "Muzaffarpur",
    name: "Muzaffarpur",
    coords: [85.4, 26.12],
    fact: "Famous for Shahi Litchi! Also a major education hub in North Bihar.",
    emoji: "🍈",
    color: "#FF6B6B",
    pop: "4.8M",
    area: "3,173 km²",
  },
  {
    id: "bhagalpur",
    geoName: "Bhagalpur",
    name: "Bhagalpur",
    coords: [86.98, 25.25],
    fact: "Silk City of India — Famous for Bhagalpuri silk. Vikramshila University ruins nearby.",
    emoji: "🧵",
    color: "#A78BFA",
    pop: "3.0M",
    area: "2,569 km²",
  },
  {
    id: "darbhanga",
    geoName: "Darbhanga",
    name: "Darbhanga",
    coords: [86.0, 26.15],
    fact: "Cultural capital of Mithila! Center of Maithili literature & art.",
    emoji: "🎨",
    color: "#34D399",
    pop: "3.9M",
    area: "2,279 km²",
  },
  {
    id: "champaran",
    geoName: "PashchimChamparan",
    name: "W. Champaran",
    coords: [84.5, 26.65],
    fact: "Where Gandhiji started Champaran Satyagraha (1917) — India's first civil disobedience!",
    emoji: "🇮🇳",
    color: "#FF9933",
    pop: "3.9M",
    area: "3,968 km²",
  },
  {
    id: "munger",
    geoName: "Munger",
    name: "Munger",
    coords: [86.47, 25.37],
    fact: "Bihar School of Yoga — World-famous yoga center. Also known for arms manufacturing.",
    emoji: "🧘",
    color: "#60A5FA",
    pop: "1.4M",
    area: "1,419 km²",
  },
  {
    id: "purnia",
    geoName: "Purnia",
    name: "Purnia",
    coords: [87.47, 25.78],
    fact: "Gateway to Northeast India. Rich in jute production and wildlife (Kosi River region).",
    emoji: "🌾",
    color: "#FBBF24",
    pop: "3.3M",
    area: "3,229 km²",
  },
  {
    id: "rohtas",
    geoName: "Rohtas",
    name: "Rohtas",
    coords: [84.02, 24.95],
    fact: "Home to Sher Shah Suri's tomb — A masterpiece of Indo-Islamic architecture!",
    emoji: "🕌",
    color: "#F472B6",
    pop: "2.9M",
    area: "3,850 km²",
  },
  {
    id: "begusarai",
    geoName: "Begusarai",
    name: "Begusarai",
    coords: [86.13, 25.42],
    fact: "Industrial capital of Bihar — Thermal power plant, refinery & the Simaria Ghat.",
    emoji: "🏭",
    color: "#818CF8",
    pop: "3.0M",
    area: "1,918 km²",
  },
];

/* Build a lookup map: geoName → district */
const districtLookup = {};
districts.forEach((d) => {
  districtLookup[d.geoName] = d;
});

/* ───────── Constellation Particles ───────── */
const ConstellationBG = ({ darkMode }) => {
  const particles = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 40; i++) {
      pts.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 1 + Math.random() * 2,
        delay: Math.random() * 4,
        duration: 3 + Math.random() * 4,
      });
    }
    return pts;
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: darkMode
              ? `rgba(255,153,51,${0.15 + Math.random() * 0.2})`
              : `rgba(255,153,51,${0.12 + Math.random() * 0.15})`,
          }}
          animate={{
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

/* ───────── Fact Card ───────── */
const FactCard = ({ district, darkMode, index, isActive, onClick }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 30 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{
        duration: 0.5,
        delay: 0.1 + index * 0.05,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative cursor-pointer"
    >
      {isActive && (
        <motion.div
          layoutId="activeCardGlow"
          className="absolute -inset-[1px] rounded-2xl pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${district.color}30, ${district.color}10, ${district.color}20)`,
            boxShadow: `0 0 20px ${district.color}15, inset 0 0 20px ${district.color}08`,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}

      <div
        className={`relative p-3.5 rounded-2xl overflow-hidden transition-all duration-300 backdrop-blur-sm
          ${
            isActive
              ? darkMode
                ? "bg-white/[0.08] border border-white/[0.12]"
                : "bg-white/90 border border-gray-200"
              : darkMode
                ? "bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.06] hover:border-white/[0.10]"
                : "bg-white/50 border border-gray-200/40 hover:bg-white/80 hover:border-gray-300"
          }`}
      >
        <motion.div
          className="absolute top-0 left-0 h-[2px] rounded-full"
          style={{ background: district.color }}
          initial={{ width: "0%" }}
          animate={{ width: isActive ? "100%" : "0%" }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        />

        <div className="flex items-start gap-3">
          <motion.div
            animate={isActive ? { scale: [1, 1.1, 1] } : { scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
            style={{
              background: isActive
                ? `${district.color}20`
                : `${district.color}08`,
              boxShadow: isActive ? `0 0 12px ${district.color}20` : "none",
            }}
          >
            {district.emoji}
          </motion.div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className="text-[11px] font-heading font-bold tracking-wider uppercase"
                style={{ color: district.color }}
              >
                {district.name}
              </span>
              {district.highlight && (
                <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-saffron/15 text-saffron font-bold tracking-wider">
                  CAPITAL
                </span>
              )}
            </div>
            <p
              className={`text-[10.5px] leading-relaxed font-body line-clamp-2
              ${darkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              {district.fact}
            </p>

            <AnimatePresence>
              {isActive && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex gap-3 mt-2 overflow-hidden"
                >
                  <span
                    className={`text-[9px] font-body ${darkMode ? "text-gray-500" : "text-gray-400"}`}
                  >
                    Pop:{" "}
                    <span className="text-saffron font-semibold">
                      {district.pop}
                    </span>
                  </span>
                  <span
                    className={`text-[9px] font-body ${darkMode ? "text-gray-500" : "text-gray-400"}`}
                  >
                    Area:{" "}
                    <span className="text-saffron font-semibold">
                      {district.area}
                    </span>
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ───────── Stats Counter Mini ───────── */
const StatMini = ({ value, label, delay, darkMode }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const end = parseInt(value, 10);
    const dur = 1500;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.floor(eased * end));
      if (p < 1) requestAnimationFrame(step);
    };
    const timer = setTimeout(() => requestAnimationFrame(step), delay);
    return () => clearTimeout(timer);
  }, [isInView, value, delay]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: delay / 1000 }}
      className="text-center"
    >
      <span className="text-xl md:text-2xl font-heading font-extrabold gradient-text tabular-nums">
        {count}
        {value.includes("+") ? "+" : ""}
        {value.includes("M") ? "M" : ""}
        {value.includes("K") ? "K" : ""}
      </span>
      <p
        className={`text-[9px] font-body tracking-wider uppercase mt-0.5
        ${darkMode ? "text-gray-500" : "text-gray-400"}`}
      >
        {label}
      </p>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
const BiharInteractiveMap = ({ className = "" }) => {
  const { darkMode } = useTheme();
  const { fullName, photoUrl } = useProfile();
  const [hoveredDistrict, setHoveredDistrict] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const sectionRef = useRef(null);
  const mapContainerRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  const activeDistrict = selectedDistrict || hoveredDistrict;

  /* ── Mouse-reactive 3D parallax tilt ── */
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { stiffness: 100, damping: 25, mass: 0.8 };
  const rotateX = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [8, -8]),
    springConfig,
  );
  const rotateY = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [-8, 8]),
    springConfig,
  );

  const handleMapMouse = useCallback(
    (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
      mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    },
    [mouseX, mouseY],
  );

  const handleMapLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  const activeColor = activeDistrict?.color || "#FF9933";

  /* ── Helper: get style for a geography ── */
  const getGeoStyle = useCallback(
    (geoName) => {
      const featured = districtLookup[geoName];
      const isActive = activeDistrict?.geoName === geoName;

      const isMobileView = window.innerWidth < 768;
      const baseFill = featured
        ? featured.highlight
          ? darkMode
            ? "rgba(255,153,51,0.14)"
            : isMobileView
              ? "rgba(255,153,51,0.25)"
              : "rgba(255,153,51,0.10)"
          : darkMode
            ? "rgba(255,153,51,0.07)"
            : isMobileView
              ? "rgba(255,153,51,0.18)"
              : "rgba(255,153,51,0.05)"
        : darkMode
          ? "rgba(20,40,65,0.5)"
          : isMobileView
            ? "rgba(220,220,220,0.9)"
            : "rgba(240,240,240,0.7)";

      const baseStroke = darkMode
        ? "rgba(255,153,51,0.15)"
        : "rgba(255,153,51,0.25)";

      if (isActive) {
        return {
          default: {
            fill: `${featured.color}30`,
            stroke: featured.color,
            strokeWidth: 1.5,
            filter: `drop-shadow(0 0 6px ${featured.color}40)`,
            transition: "all 250ms ease",
            cursor: "pointer",
            outline: "none",
          },
          hover: {
            fill: `${featured.color}40`,
            stroke: featured.color,
            strokeWidth: 2,
            filter: `drop-shadow(0 0 10px ${featured.color}50)`,
            cursor: "pointer",
            outline: "none",
          },
          pressed: {
            fill: `${featured.color}50`,
            stroke: featured.color,
            strokeWidth: 2,
            outline: "none",
          },
        };
      }

      return {
        default: {
          fill: baseFill,
          stroke: baseStroke,
          strokeWidth: 0.5,
          transition: "all 250ms ease",
          cursor: featured ? "pointer" : "default",
          outline: "none",
        },
        hover: {
          fill: featured
            ? `${featured.color}20`
            : darkMode
              ? "rgba(255,153,51,0.10)"
              : "rgba(255,153,51,0.08)",
          stroke: featured ? featured.color : baseStroke,
          strokeWidth: featured ? 1 : 0.7,
          filter: featured
            ? `drop-shadow(0 0 4px ${featured.color}30)`
            : "none",
          cursor: featured ? "pointer" : "default",
          outline: "none",
        },
        pressed: {
          fill: featured ? `${featured.color}30` : baseFill,
          stroke: baseStroke,
          outline: "none",
        },
      };
    },
    [activeDistrict, darkMode],
  );

  return (
    <section
      ref={sectionRef}
      id="bihar-map"
      className={`section-padding relative overflow-hidden ${className}`}
    >
      {/* ═══ Deep atmospheric background ═══ */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: darkMode
              ? "radial-gradient(ellipse at 50% 30%, rgba(255,153,51,0.03) 0%, rgba(10,25,47,0) 60%)"
              : "radial-gradient(ellipse at 50% 30%, rgba(255,153,51,0.02) 0%, transparent 60%)",
          }}
        />
        <ConstellationBG darkMode={darkMode} />
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full"
          style={{
            background: `radial-gradient(circle, ${darkMode ? "rgba(255,153,51,0.05)" : "rgba(255,153,51,0.03)"} 0%, transparent 70%)`,
            top: "5%",
            right: "-10%",
            filter: "blur(80px)",
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full"
          style={{
            background: `radial-gradient(circle, ${darkMode ? "rgba(255,215,0,0.04)" : "rgba(255,215,0,0.025)"} 0%, transparent 70%)`,
            bottom: "10%",
            left: "-5%",
            filter: "blur(60px)",
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* ═══ Section Header ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14"
        >
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={isInView ? { scale: 1, rotate: 0 } : {}}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.15,
            }}
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 backdrop-blur-sm
              ${
                darkMode
                  ? "bg-saffron/[0.08] border border-saffron/20"
                  : "bg-saffron/[0.06] border border-saffron/25"
              }`}
          >
            <HiSparkles className="text-saffron text-sm" />
            <span
              className={`text-[11px] font-body font-semibold tracking-[0.15em] uppercase
              ${darkMode ? "text-saffron-light" : "text-saffron-dark"}`}
            >
              Interactive Experience
            </span>
          </motion.div>

          <h2
            className={`text-3xl md:text-5xl font-heading font-bold mb-4
            ${darkMode ? "text-white" : "text-navy"}`}
          >
            Explore <span className="gradient-text">Bihar</span>
          </h2>
          <p
            className={`text-base font-body max-w-md mx-auto leading-relaxed
            ${darkMode ? "text-gray-400" : "text-gray-500"}`}
          >
            Tilt, hover, and explore — discover the districts that shaped my
            journey.
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-saffron via-gold to-saffron mx-auto rounded-full mt-5" />
        </motion.div>

        {/* ═══ Map + Sidebar Layout ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* ─── MAP PANEL (Left) ─── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 xl:col-span-8"
          >
            {/* 3D Perspective Wrapper */}
            <motion.div
              ref={mapContainerRef}
              onMouseMove={handleMapMouse}
              onMouseLeave={handleMapLeave}
              style={{
                perspective: 1200,
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
              }}
              className="cursor-default"
            >
              <motion.div
                className={`relative rounded-3xl overflow-hidden
                  ${
                    darkMode
                      ? "bg-gradient-to-br from-[#0d1b2e] via-[#0f2034] to-[#0a1628] border border-white/[0.06]"
                      : "bg-gradient-to-br from-white via-gray-50 to-white border border-gray-200/70"
                  }`}
                style={{
                  transformStyle: "preserve-3d",
                  boxShadow: darkMode
                    ? `0 25px 60px -10px rgba(0,0,0,0.5), 0 0 40px -5px ${activeColor}10, inset 0 1px 0 rgba(255,255,255,0.03)`
                    : `0 25px 60px -10px rgba(0,0,0,0.1), 0 0 40px -5px ${activeColor}08`,
                }}
              >
                {/* Hex grid overlay */}
                <div
                  className="absolute inset-0 pointer-events-none z-0"
                  style={{
                    opacity: darkMode ? 0.03 : 0.02,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23FF9933' fill-opacity='1'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  }}
                />

                <div className="relative p-5 md:p-8 z-10">
                  {/* Top bar */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt className="text-saffron text-xs" />
                      <span
                        className={`text-[10px] font-body font-semibold tracking-[0.2em] uppercase
                        ${darkMode ? "text-gray-500" : "text-gray-400"}`}
                      >
                        Bihar • India
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                      />
                      <span
                        className={`text-[10px] font-body ${darkMode ? "text-gray-600" : "text-gray-400"}`}
                      >
                        Live Interactive
                      </span>
                    </div>
                  </div>

                  {/* ═══ REAL GEOGRAPHIC MAP ═══ */}
                  <ComposableMap
                    projection="geoMercator"
                    projectionConfig={{
                      center: [85.75, 25.65],
                      scale: 5800,
                    }}
                    width={500}
                    height={480}
                    style={{ width: "100%", height: "auto" }}
                  >
                    <Geographies geography={GEO_URL}>
                      {({ geographies }) =>
                        geographies.map((geo) => {
                          const geoName = geo.properties.NAME_2;
                          const featured = districtLookup[geoName];
                          return (
                            <Geography
                              key={geo.rsmKey}
                              geography={geo}
                              onMouseEnter={() => {
                                if (featured) setHoveredDistrict(featured);
                              }}
                              onMouseLeave={() => setHoveredDistrict(null)}
                              onClick={() => {
                                if (featured) {
                                  setSelectedDistrict(
                                    selectedDistrict?.id === featured.id
                                      ? null
                                      : featured,
                                  );
                                }
                              }}
                              style={getGeoStyle(geoName)}
                            />
                          );
                        })
                      }
                    </Geographies>

                    {/* Radar pulse rings from Patna */}
                    <Marker coordinates={[85.14, 25.61]}>
                      {[0, 1, 2].map((i) => (
                        <motion.circle
                          key={i}
                          r={5}
                          fill="none"
                          stroke="#FF9933"
                          strokeWidth={0.5}
                          initial={{ r: 5, opacity: 0.5, strokeWidth: 0.5 }}
                          animate={{ r: 40, opacity: 0, strokeWidth: 0.1 }}
                          transition={{
                            duration: 3,
                            delay: i * 1,
                            repeat: Infinity,
                            ease: "easeOut",
                          }}
                        />
                      ))}
                    </Marker>

                    {/* District name labels for featured districts */}
                    {districts.map((d) => (
                      <Marker key={d.id + "-label"} coordinates={d.coords}>
                        <text
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill={
                            activeDistrict?.id === d.id
                              ? d.color
                              : darkMode
                                ? "rgba(255,255,255,0.45)"
                                : "rgba(10,25,47,0.45)"
                          }
                          fontSize={activeDistrict?.id === d.id ? 7 : 5.5}
                          fontFamily="Poppins, sans-serif"
                          fontWeight={activeDistrict?.id === d.id ? 700 : 500}
                          style={{
                            transition: "all 250ms ease",
                            pointerEvents: "none",
                            textShadow: darkMode
                              ? "0 1px 3px rgba(0,0,0,0.6)"
                              : "none",
                          }}
                        >
                          {d.name}
                        </text>
                      </Marker>
                    ))}

                    {/* Emoji marker for active district */}
                    {activeDistrict && (
                      <Marker coordinates={activeDistrict.coords}>
                        <motion.text
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontSize={14}
                          y={-16}
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: -16 }}
                          style={{ pointerEvents: "none" }}
                        >
                          {activeDistrict.emoji}
                        </motion.text>
                      </Marker>
                    )}

                    {/* Profile badge pinned at Patna */}
                    <Marker coordinates={[85.14, 25.61]}>
                      <motion.g
                        initial={{ scale: 0, opacity: 0 }}
                        animate={isInView ? { scale: 1, opacity: 1 } : {}}
                        transition={{
                          type: "spring",
                          stiffness: 200,
                          damping: 15,
                          delay: 1.2,
                        }}
                      >
                        <motion.g
                          animate={{ y: [0, -3, 0] }}
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        >
                          {/* Outer glow */}
                          <circle
                            r={10}
                            fill="none"
                            stroke="#FF9933"
                            strokeWidth={1}
                            opacity={0.3}
                          />
                          {/* Photo clip */}
                          <defs>
                            <clipPath id="patna-photo-clip">
                              <circle r={7} />
                            </clipPath>
                          </defs>
                          <circle
                            r={8}
                            fill={darkMode ? "#0A192F" : "#fff"}
                            stroke="#FF9933"
                            strokeWidth={1.5}
                          />
                          <image
                            href="/IMG_20180505_065332.webp"
                            x={-7}
                            y={-7}
                            width={14}
                            height={14}
                            clipPath="url(#patna-photo-clip)"
                            preserveAspectRatio="xMidYMid slice"
                          />
                          {/* Ping rings */}
                          {[0, 1].map((i) => (
                            <motion.circle
                              key={`ping-${i}`}
                              r={8}
                              fill="none"
                              stroke="rgba(255,153,51,0.4)"
                              strokeWidth={0.5}
                              animate={{ r: [8, 22], opacity: [0.4, 0] }}
                              transition={{
                                duration: 2.5,
                                delay: i * 1.2,
                                repeat: Infinity,
                                ease: "easeOut",
                              }}
                            />
                          ))}
                        </motion.g>
                      </motion.g>
                    </Marker>
                  </ComposableMap>

                  {/* Bottom tooltip card */}
                  <AnimatePresence mode="wait">
                    {activeDistrict && (
                      <motion.div
                        key={activeDistrict.id}
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.97 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className={`mt-4 px-5 py-4 rounded-2xl backdrop-blur-xl relative overflow-hidden
                          ${
                            darkMode
                              ? "bg-white/[0.04] border border-white/[0.08]"
                              : "bg-white/80 border border-gray-200/80 shadow-lg"
                          }`}
                        style={{
                          boxShadow: darkMode
                            ? `0 8px 30px -5px rgba(0,0,0,0.4), 0 0 15px ${activeDistrict.color}10`
                            : `0 8px 30px -5px rgba(0,0,0,0.08)`,
                        }}
                      >
                        <div
                          className="absolute top-0 left-0 w-full h-[2px]"
                          style={{
                            background: `linear-gradient(90deg, ${activeDistrict.color}, ${activeDistrict.color}40, transparent)`,
                          }}
                        />
                        <div className="flex items-center gap-4">
                          <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                            style={{
                              background: `${activeDistrict.color}15`,
                              boxShadow: `0 0 20px ${activeDistrict.color}15`,
                            }}
                          >
                            {activeDistrict.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className="text-sm font-heading font-bold"
                                style={{ color: activeDistrict.color }}
                              >
                                {activeDistrict.name}
                              </span>
                              {activeDistrict.highlight && (
                                <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-saffron/15 text-saffron font-bold">
                                  CAPITAL
                                </span>
                              )}
                            </div>
                            <p
                              className={`text-xs leading-relaxed mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                            >
                              {activeDistrict.fact}
                            </p>
                          </div>
                          <div
                            className={`hidden sm:flex flex-col items-end gap-1 text-[9px] font-body flex-shrink-0
                            ${darkMode ? "text-gray-500" : "text-gray-400"}`}
                          >
                            <span>
                              Pop:{" "}
                              <span className="text-saffron font-semibold">
                                {activeDistrict.pop}
                              </span>
                            </span>
                            <span>
                              Area:{" "}
                              <span className="text-saffron font-semibold">
                                {activeDistrict.area}
                              </span>
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Legend + Stats bar */}
                  <div
                    className={`flex items-center justify-between mt-5 pt-4 border-t
                    ${darkMode ? "border-white/[0.05]" : "border-gray-200/50"}`}
                  >
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-saffron/60 ring-2 ring-saffron/20" />
                        <span
                          className={`text-[9px] font-body ${darkMode ? "text-gray-600" : "text-gray-400"}`}
                        >
                          Capital
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div
                          className={`w-2 h-2 rounded-full ${darkMode ? "bg-white/15 ring-2 ring-white/5" : "bg-gray-300 ring-2 ring-gray-200"}`}
                        />
                        <span
                          className={`text-[9px] font-body ${darkMode ? "text-gray-600" : "text-gray-400"}`}
                        >
                          District
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full overflow-hidden border border-saffron/40">
                          <img
                            src="/IMG_20180505_065332.webp"
                            loading="lazy"
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span
                          className={`text-[9px] font-body ${darkMode ? "text-gray-600" : "text-gray-400"}`}
                        >
                          My Location
                        </span>
                      </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-5">
                      <StatMini
                        value="38"
                        label="Districts"
                        delay={200}
                        darkMode={darkMode}
                      />
                      <StatMini
                        value="12"
                        label="Featured"
                        delay={400}
                        darkMode={darkMode}
                      />
                      <StatMini
                        value="124M"
                        label="Population"
                        delay={600}
                        darkMode={darkMode}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* ─── SIDEBAR (Right) ─── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-1 h-6 rounded-full bg-gradient-to-b from-saffron to-gold" />
                <h3
                  className={`text-base font-heading font-bold ${darkMode ? "text-white" : "text-navy"}`}
                >
                  District <span className="gradient-text">Highlights</span>
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                <FaInfoCircle
                  className={`text-[10px] ${darkMode ? "text-gray-600" : "text-gray-400"}`}
                />
                <span
                  className={`text-[9px] font-body ${darkMode ? "text-gray-600" : "text-gray-400"}`}
                >
                  Tap to explore
                </span>
              </div>
            </div>

            <div
              className="flex flex-col gap-2 max-h-[480px] overflow-y-auto pr-1
              scrollbar-thin scrollbar-thumb-saffron/20 scrollbar-track-transparent"
            >
              {districts.map((district, i) => (
                <FactCard
                  key={district.id}
                  district={district}
                  darkMode={darkMode}
                  index={i}
                  isActive={activeDistrict?.id === district.id}
                  onClick={() =>
                    setSelectedDistrict(
                      selectedDistrict?.id === district.id ? null : district,
                    )
                  }
                />
              ))}
            </div>

            {/* Personal connection card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className={`relative p-4 rounded-2xl overflow-hidden backdrop-blur-sm
                ${
                  darkMode
                    ? "bg-gradient-to-br from-saffron/[0.06] via-gold/[0.03] to-saffron/[0.06] border border-saffron/10"
                    : "bg-gradient-to-br from-saffron/[0.05] via-gold/[0.02] to-saffron/[0.05] border border-saffron/15"
                }`}
            >
              <div
                className="absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle, rgba(255,153,51,0.12) 0%, transparent 70%)",
                  filter: "blur(10px)",
                }}
              />
              <div className="flex items-center gap-3 relative">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-saffron/30
                    shadow-[0_0_10px_rgba(255,153,51,0.2)]"
                >
                  <img
                    src={photoUrl}
                    alt={fullName}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                <div>
                  <p
                    className={`text-xs font-body leading-relaxed ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    <span className="text-saffron font-semibold">
                      {fullName}
                    </span>{" "}
                    — Proudly rooted in Bihar, drawing daily inspiration from
                    its legacy of knowledge.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BiharInteractiveMap;
