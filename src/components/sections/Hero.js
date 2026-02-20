import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import MagneticButton from "../ui/MagneticButton";

/* ═══════════════════════════════════════════════════════════════
   HERO — Premium Magnetic Depth-Layer Experience
   
   Inspired by Apple, Linear, Vercel — top 1% craft.
   
   ▸ Lenis-class silky mouse tracking
   ▸ Multi-layer parallax depth (translateZ)
   ▸ Magnetic photo tilt with spring physics
   ▸ Floating blurred gradient orbs (ambient)
   ▸ Soft glassmorphism name card
   ▸ Noise texture + animated light
   ▸ Calm, powerful micro-interactions
═══════════════════════════════════════════════════════════════ */

/* ── Constants ── */
const TYPING_WORDS = [
  "BPSC Aspirant",
  "Future Educator",
  "Dreamer",
  "Bihar Roots",
];

/* ── Aurora Bento Constants (mobile) ── */
const AURORA_TAGS = [
  { text: "BPSC Aspirant", bg: "rgba(255,107,107,0.12)", color: "#D63031" },
  { text: "Future Educator", bg: "rgba(162,155,254,0.15)", color: "#6C5CE7" },
  { text: "Bihar Roots", bg: "rgba(255,159,67,0.12)", color: "#E17055" },
  { text: "Consistent", bg: "rgba(85,239,196,0.15)", color: "#00B894" },
  { text: "Dreamer", bg: "rgba(253,121,168,0.12)", color: "#E84393" },
  { text: "2026 \uD83C\uDFAF", bg: "rgba(13,13,13,0.07)", color: "#3D3535" },
];
const AURORA_PROGRESS = [
  {
    label: "General Studies",
    pct: 78,
    grad: "linear-gradient(to right,#FF9F43,#FF6B6B)",
  },
  {
    label: "B.Ed Coursework",
    pct: 62,
    grad: "linear-gradient(to right,#A29BFE,#FD79A8)",
  },
  {
    label: "Mock Tests",
    pct: 45,
    grad: "linear-gradient(to right,#55EFC4,#00B894)",
  },
];
const AURORA_LINKS = [
  {
    icon: "\u2709\uFE0F",
    label: "Email",
    href: "#contact",
    bg: "rgba(255,107,107,0.12)",
  },
  {
    icon: "\uD83D\uDCBC",
    label: "LinkedIn",
    href: "#contact",
    bg: "rgba(162,155,254,0.12)",
  },
  {
    icon: "\uD83D\uDCF1",
    label: "WhatsApp",
    href: "https://wa.me/917643044297",
    bg: "rgba(85,239,196,0.12)",
  },
];
const auroraGlass = {
  background: "rgba(255,255,255,0.72)",
  border: "1px solid rgba(255,255,255,0.9)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  boxShadow:
    "0 2px 0 rgba(255,255,255,0.8) inset,0 8px 32px -8px rgba(0,0,0,0.08),0 2px 8px -2px rgba(0,0,0,0.05)",
  borderRadius: 24,
};

/* ── Typing Effect (smooth) ── */
const useTypingEffect = (speed = 100, delSpeed = 45, pause = 2200) => {
  const [text, setText] = useState("");
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState("typing");

  useEffect(() => {
    const word = TYPING_WORDS[idx];
    let t;
    if (phase === "typing") {
      if (text.length < word.length)
        t = setTimeout(() => setText(word.slice(0, text.length + 1)), speed);
      else t = setTimeout(() => setPhase("deleting"), pause);
    } else {
      if (text.length > 0)
        t = setTimeout(() => setText(word.slice(0, text.length - 1)), delSpeed);
      else {
        setIdx((p) => (p + 1) % TYPING_WORDS.length);
        setPhase("typing");
      }
    }
    return () => clearTimeout(t);
  }, [text, phase, idx, speed, delSpeed, pause]);

  return text;
};

/* ── Smart Greeting ── */
const useSmartGreeting = () => {
  const [greeting, setGreeting] = useState("");
  const [isReturning, setIsReturning] = useState(false);

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(
      h >= 5 && h < 12
        ? "Good Morning ☀️"
        : h < 17
          ? "Good Afternoon 🌤️"
          : h < 21
            ? "Good Evening 🌙"
            : "Hello, Night Owl 🦉",
    );
    try {
      if (localStorage.getItem("portfolio_visited")) setIsReturning(true);
      localStorage.setItem("portfolio_visited", Date.now().toString());
    } catch (e) {
      /* noop */
    }
  }, []);

  return { greeting, isReturning };
};

/* ── CSS Injector ── */
const StyleInjector = () => (
  <style>{`
    @keyframes hero-orb-float {
      0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
      25% { transform: translate3d(30px, -20px, 0) scale(1.05); }
      50% { transform: translate3d(-10px, 25px, 0) scale(0.97); }
      75% { transform: translate3d(-25px, -15px, 0) scale(1.03); }
    }
    @keyframes hero-gradient-shift {
      0%, 100% { opacity: 0.5; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.1); }
    }
    @keyframes hero-light-sweep {
      0% { transform: translateX(-100%) skewX(-15deg); }
      100% { transform: translateX(300%) skewX(-15deg); }
    }
    @keyframes hero-ring-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes hero-photo-float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }
    @keyframes hero-noise {
      0% { transform: translate3d(0, 0, 0); }
      25% { transform: translate3d(-5%, -5%, 0); }
      50% { transform: translate3d(5%, -10%, 0); }
      75% { transform: translate3d(-10%, 5%, 0); }
      100% { transform: translate3d(0, 0, 0); }
    }
    /* Arched mirror shape — rounded top, flat bottom */
    .arch-mirror-shape {
      border-radius: 999px 999px 0 0;
    }
    /* Smooth touch scrolling */
    @media (hover: none) {
      * { -webkit-tap-highlight-color: transparent; }
    }
  `}</style>
);

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   FLOATING GRADIENT ORBS
   Reduced to 3 for performance
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const FloatingOrbs = ({ darkMode }) => {
  const orbs = useMemo(
    () => [
      {
        size: 300,
        x: "15%",
        y: "20%",
        color: darkMode ? "rgba(255,153,51,0.06)" : "rgba(255,153,51,0.08)",
        delay: 0,
        duration: 20,
      },
      {
        size: 250,
        x: "70%",
        y: "55%",
        color: darkMode ? "rgba(255,215,0,0.05)" : "rgba(255,215,0,0.06)",
        delay: 5,
        duration: 24,
      },
      {
        size: 200,
        x: "40%",
        y: "70%",
        color: darkMode ? "rgba(244,162,97,0.04)" : "rgba(244,162,97,0.05)",
        delay: 10,
        duration: 22,
      },
    ],
    [darkMode],
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {orbs.map((orb, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            filter: `blur(${orb.size * 0.3}px)`,
            animation: `hero-orb-float ${orb.duration}s ease-in-out infinite`,
            animationDelay: `${orb.delay}s`,
            willChange: "transform",
            contain: "layout paint",
          }}
        />
      ))}
    </div>
  );
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   NOISE TEXTURE
   Subtle animated grain overlay
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const NoiseTexture = () => (
  <div
    className="absolute inset-0 pointer-events-none z-[1]"
    style={{ opacity: 0.018, mixBlendMode: "overlay" }}
  >
    <div
      className="absolute inset-[-50%] w-[200%] h-[200%]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: "256px 256px",
        animation: "hero-noise 8s steps(10) infinite",
      }}
    />
  </div>
);

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   3D ARCHED MIRROR PHOTO CARD
   Tall arch shape · Photo pops out of frame
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const MagneticPhoto = ({ darkMode, scrollScale }) => {
  const containerRef = useRef(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  const springConfig = { stiffness: 60, damping: 30, mass: 1.2 };
  const sRotateX = useSpring(rotateX, springConfig);
  const sRotateY = useSpring(rotateY, springConfig);
  const sX = useSpring(x, { stiffness: 40, damping: 25 });
  const sY = useSpring(y, { stiffness: 40, damping: 25 });

  const lightX = useMotionValue(50);
  const lightY = useMotionValue(50);
  const sLightX = useSpring(lightX, { stiffness: 30, damping: 20 });
  const sLightY = useSpring(lightY, { stiffness: 30, damping: 20 });

  const handleMove = useCallback(
    (e) => {
      if (!containerRef.current || isMobile) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);

      rotateX.set(dy * -10);
      rotateY.set(dx * 10);
      x.set(dx * 8);
      y.set(dy * 8);
      lightX.set(50 + dx * 35);
      lightY.set(50 + dy * 35);
    },
    [rotateX, rotateY, x, y, lightX, lightY, isMobile],
  );

  const handleLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
    x.set(0);
    y.set(0);
    lightX.set(50);
    lightY.set(50);
  }, [rotateX, rotateY, x, y, lightX, lightY]);

  /* Arched mirror SVG path for border outline */
  const archBorderRadius = "999px 999px 0 0";

  /* Pre-compute useTransform to avoid conditional hook call */
  const lightReflectionBg = useTransform(
    [sLightX, sLightY],
    ([lx, ly]) =>
      `radial-gradient(ellipse 60% 50% at ${lx}% ${ly}%, rgba(255,255,255,${darkMode ? 0.05 : 0.1}) 0%, transparent 70%)`,
  );

  /* ── MOBILE: Clean circular portrait with depth ── */
  if (isMobile) {
    return (
      <motion.div
        className="relative cursor-default flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Soft ambient glow — no clutter, just warmth */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: "320px",
            height: "320px",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            background: darkMode
              ? "radial-gradient(circle, rgba(255,153,51,0.08) 0%, rgba(255,215,0,0.03) 50%, transparent 75%)"
              : "radial-gradient(circle, rgba(255,153,51,0.10) 0%, rgba(255,215,0,0.04) 50%, transparent 75%)",
            filter: "blur(30px)",
          }}
        />

        {/* Floating photo with subtle animation */}
        <div
          style={{
            animation: "hero-photo-float 4s ease-in-out infinite",
          }}
        >
          <motion.div
            style={{ scale: scrollScale }}
            className="relative w-[200px] h-[200px]"
          >
            {/* Soft outer glow ring (no hard borders) */}
            <div
              className="absolute -inset-[6px] rounded-full"
              style={{
                background: darkMode
                  ? "radial-gradient(circle, rgba(255,153,51,0.15) 60%, rgba(255,215,0,0.05) 80%, transparent 100%)"
                  : "radial-gradient(circle, rgba(255,153,51,0.12) 60%, rgba(255,215,0,0.04) 80%, transparent 100%)",
                filter: "blur(8px)",
              }}
            />

            {/* Thin subtle border */}
            <div
              className="absolute -inset-[1px] rounded-full"
              style={{
                background: darkMode
                  ? "linear-gradient(135deg, rgba(255,153,51,0.25), rgba(255,215,0,0.1), rgba(255,153,51,0.15))"
                  : "linear-gradient(135deg, rgba(255,153,51,0.3), rgba(255,215,0,0.12), rgba(255,153,51,0.2))",
              }}
            />

            {/* Photo container */}
            <div
              className="absolute inset-0 rounded-full overflow-hidden"
              style={{
                boxShadow: darkMode
                  ? "0 16px 40px -8px rgba(0,0,0,0.5), 0 6px 16px -4px rgba(0,0,0,0.3)"
                  : "0 16px 40px -8px rgba(0,0,0,0.08), 0 6px 16px -4px rgba(0,0,0,0.04)",
              }}
            >
              <img
                src="/rehman.jpeg"
                alt="Bipin Kumar"
                className="w-full h-full object-cover object-top"
                draggable="false"
                loading="eager"
              />

              {/* Subtle top-light reflection */}
              <div
                className="absolute inset-0 pointer-events-none rounded-full"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 35%)",
                }}
              />
            </div>

            {/* Online status dot */}
            <div className="absolute bottom-2 right-2 z-20">
              <div className="relative">
                <span className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-400/30 animate-ping" />
                <span
                  className="relative block w-3 h-3 rounded-full bg-emerald-400 border-[2px]"
                  style={{ borderColor: darkMode ? "#060d1a" : "#fafbfc" }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  /* ── DESKTOP: Arched mirror 3D photo ── */
  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="relative cursor-default"
      style={{ perspective: 1000 }}
      initial={{ opacity: 0, scale: 0.85, filter: "blur(20px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 1.2, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* ── Ambient glow ── */}
      <div className="absolute inset-[-25%] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: darkMode
              ? "radial-gradient(ellipse 55% 65% at 50% 55%, rgba(255,153,51,0.10) 0%, rgba(255,215,0,0.04) 40%, transparent 70%)"
              : "radial-gradient(ellipse 55% 65% at 50% 55%, rgba(255,153,51,0.12) 0%, rgba(255,215,0,0.06) 40%, transparent 70%)",
            filter: "blur(45px)",
            animation: "hero-gradient-shift 12s ease-in-out infinite",
            contain: "layout paint",
          }}
        />
      </div>

      {/* ── 3D Tilting Container ── */}
      <motion.div
        style={{
          rotateX: sRotateX,
          rotateY: sRotateY,
          x: sX,
          y: sY,
          transformStyle: "preserve-3d",
          scale: scrollScale,
        }}
        className="relative w-[310px] h-[420px] lg:w-[340px] lg:h-[460px] xl:w-[370px] xl:h-[500px]"
      >
        {/* ═══ LAYER 1: Ground shadow ═══ */}
        <div
          className="absolute"
          style={{
            bottom: "-10%",
            left: "15%",
            right: "15%",
            height: "25%",
            transform: "translateZ(-80px) rotateX(60deg)",
            background: darkMode
              ? "radial-gradient(ellipse, rgba(0,0,0,0.45) 0%, transparent 70%)"
              : "radial-gradient(ellipse, rgba(0,0,0,0.12) 0%, transparent 70%)",
            filter: "blur(22px)",
          }}
        />

        {/* ═══ LAYER 2: Glass arch frame (behind photo) ═══ */}
        <motion.div
          className="absolute inset-0 overflow-hidden"
          style={{
            borderRadius: archBorderRadius,
            transform: "translateZ(-10px)",
            boxShadow: darkMode
              ? "0 45px 90px -20px rgba(0,0,0,0.5), 0 25px 50px -12px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.05)"
              : "0 45px 90px -20px rgba(0,0,0,0.10), 0 25px 50px -12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
          }}
        >
          {/* Glass fill */}
          <div
            className={`absolute inset-0 backdrop-blur-xl ${
              darkMode ? "bg-white/[0.04]" : "bg-white/60"
            }`}
          />

          {/* Gradient shimmer */}
          <div
            className="absolute inset-0"
            style={{
              background: darkMode
                ? "linear-gradient(160deg, rgba(255,153,51,0.06) 0%, transparent 30%, transparent 70%, rgba(255,215,0,0.04) 100%)"
                : "linear-gradient(160deg, rgba(255,153,51,0.08) 0%, transparent 30%, transparent 70%, rgba(255,215,0,0.05) 100%)",
            }}
          />

          {/* Light reflection on glass */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: lightReflectionBg,
            }}
          />

          {/* Light sweep */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute inset-0 w-[35%] h-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)",
                animation: "hero-light-sweep 7s ease-in-out infinite",
                animationDelay: "2s",
              }}
            />
          </div>
        </motion.div>

        {/* ═══ Arch border ring (saffron glow outline) ═══ */}
        <div
          className="absolute -inset-[2px] pointer-events-none"
          style={{
            borderRadius: archBorderRadius,
            transform: "translateZ(-5px)",
            background: darkMode
              ? "linear-gradient(160deg, rgba(255,153,51,0.20), rgba(255,215,0,0.08), rgba(255,153,51,0.12))"
              : "linear-gradient(160deg, rgba(255,153,51,0.25), rgba(255,215,0,0.10), rgba(255,153,51,0.15))",
            padding: "2px",
            WebkitMask:
              "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />

        {/* ═══ LAYER 3: PHOTO — breaks OUT of the arch frame ═══ */}
        <motion.div
          className="absolute inset-0 z-10"
          style={{ transform: "translateZ(40px)" }}
        >
          <div className="relative w-full h-full overflow-visible">
            <img
              src="/rehman.jpeg"
              alt="Bipin Kumar"
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[95%] object-cover object-top"
              draggable="false"
              loading="eager"
              style={{
                height: "110%",
                willChange: "transform",
                borderRadius: archBorderRadius,
                filter: darkMode
                  ? "drop-shadow(0 18px 35px rgba(0,0,0,0.45)) drop-shadow(0 6px 14px rgba(0,0,0,0.25))"
                  : "drop-shadow(0 18px 35px rgba(0,0,0,0.12)) drop-shadow(0 6px 14px rgba(0,0,0,0.06))",
                maskImage:
                  "linear-gradient(to bottom, black 80%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, black 80%, transparent 100%)",
              }}
            />
          </div>
        </motion.div>

        {/* ═══ LAYER 4: Front arch glass overlay ═══ */}
        <div
          className="absolute inset-0 pointer-events-none z-20"
          style={{
            borderRadius: archBorderRadius,
            transform: "translateZ(50px)",
            background: darkMode
              ? "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 25%, transparent 75%, rgba(6,13,26,0.15) 100%)"
              : "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 25%, transparent 75%, rgba(250,251,252,0.08) 100%)",
            border: darkMode
              ? "1px solid rgba(255,255,255,0.03)"
              : "1px solid rgba(255,255,255,0.3)",
          }}
        />

        {/* ═══ LAYER 5: Saffron accent glow at arch bottom ═══ */}
        <div
          className="absolute z-20 rounded-full"
          style={{
            bottom: "0%",
            left: "22%",
            right: "22%",
            height: "3px",
            transform: "translateZ(55px)",
            background:
              "linear-gradient(90deg, transparent, rgba(255,153,51,0.45), rgba(255,215,0,0.35), transparent)",
            filter: "blur(1px)",
          }}
        />

        {/* Floating badge — BPSC 2026 */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            delay: 1.8,
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="absolute -bottom-4 -right-3 z-30"
          style={{ transform: "translateZ(70px)" }}
        >
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className={`px-4 py-2.5 rounded-2xl backdrop-blur-2xl border
              ${
                darkMode
                  ? "bg-white/[0.06] border-white/[0.1] shadow-2xl shadow-black/30"
                  : "bg-white/70 border-white/50 shadow-2xl shadow-gray-200/50"
              }`}
          >
            <span className="text-[10px] font-heading font-bold tracking-[0.12em] uppercase bg-gradient-to-r from-saffron to-gold bg-clip-text text-transparent">
              BPSC 2026
            </span>
          </motion.div>
        </motion.div>

        {/* Top-left status badge */}
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            delay: 2.1,
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="absolute top-2 -left-3 z-30"
          style={{ transform: "translateZ(65px)" }}
        >
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl backdrop-blur-2xl border
              ${
                darkMode
                  ? "bg-white/[0.06] border-white/[0.1] shadow-2xl shadow-black/30"
                  : "bg-white/70 border-white/50 shadow-2xl shadow-gray-200/50"
              }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span
              className={`text-[9px] font-body font-medium tracking-wider uppercase
                ${darkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              B.Ed Student
            </span>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   GLASSMORPHISM NAME CARD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const GlassNameCard = ({ darkMode, children }) => (
  <div
    className={`relative rounded-3xl p-6 sm:p-8 backdrop-blur-2xl border overflow-hidden
      ${
        darkMode
          ? "bg-white/[0.03] border-white/[0.06]"
          : "bg-white/50 border-white/60"
      }`}
    style={{
      boxShadow: darkMode
        ? "0 32px 64px -16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)"
        : "0 32px 64px -16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
    }}
  >
    {/* Inner light gradient */}
    <div
      className="absolute inset-0 pointer-events-none rounded-3xl"
      style={{
        background: darkMode
          ? "linear-gradient(135deg, rgba(255,153,51,0.02) 0%, transparent 50%, rgba(255,215,0,0.01) 100%)"
          : "linear-gradient(135deg, rgba(255,153,51,0.03) 0%, transparent 50%, rgba(255,215,0,0.02) 100%)",
      }}
    />
    <div className="relative z-10">{children}</div>
  </div>
);

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MOBILE HERO — Aurora Bento Card Layout
   Matches HeroAuroraBento.jsx design exactly
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const MobileHeroBento = ({ typedText, greeting }) => {
  const bentoDelay = (d) => ({
    initial: { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.65, delay: d, ease: [0.25, 0.46, 0.45, 0.94] },
  });

  return (
    <div
      style={{
        position: "relative",
        zIndex: 10,
        padding: "0 14px 32px",
        display: "flex",
        flexDirection: "column",
        gap: 11,
      }}
    >
      {/* ── CARD 1: Profile ── */}
      <motion.div {...bentoDelay(0.05)} style={auroraGlass}>
        <div style={{ padding: "22px 20px 18px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 14,
              marginBottom: 14,
            }}
          >
            {/* Photo with spinning gradient ring */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div
                className="hero-bento-spin"
                style={{
                  position: "absolute",
                  inset: -3,
                  borderRadius: "50%",
                  zIndex: 0,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: -1,
                  borderRadius: "50%",
                  background: "white",
                  zIndex: 1,
                }}
              />
              <div
                style={{
                  width: 78,
                  height: 78,
                  borderRadius: "50%",
                  overflow: "hidden",
                  position: "relative",
                  zIndex: 2,
                }}
              >
                <img
                  src="/rehman.jpeg"
                  alt="Bipin Kumar"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center 10%",
                  }}
                  draggable="false"
                  loading="eager"
                />
              </div>
              <div
                className="hero-bento-ping"
                style={{
                  position: "absolute",
                  bottom: 3,
                  right: 3,
                  zIndex: 3,
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: "#00C48C",
                  border: "2px solid white",
                }}
              />
            </div>

            {/* Name + meta */}
            <div style={{ flex: 1, paddingTop: 2 }}>
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "rgba(13,13,13,0.4)",
                  marginBottom: 3,
                }}
              >
                {greeting}
              </p>
              <span
                style={{
                  display: "block",
                  fontFamily: "'Playfair Display',serif",
                  fontStyle: "italic",
                  fontSize: 27,
                  lineHeight: 1,
                  color: "#0D0D0D",
                  letterSpacing: "-0.02em",
                }}
              >
                Bipin
              </span>
              <span
                style={{
                  display: "block",
                  position: "relative",
                  fontWeight: 800,
                  fontSize: 29,
                  lineHeight: 1,
                  letterSpacing: "-0.04em",
                  background:
                    "linear-gradient(135deg,#FF6B6B 0%,#FF9F43 50%,#A29BFE 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Kumar
              </span>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 5,
                  marginTop: 7,
                }}
              >
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 500,
                    letterSpacing: "0.06em",
                    background: "rgba(13,13,13,0.06)",
                    color: "#3D3535",
                    borderRadius: 100,
                    padding: "3px 8px",
                  }}
                >
                  📍 Bihar, India
                </span>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 500,
                    letterSpacing: "0.06em",
                    background:
                      "linear-gradient(135deg,rgba(255,107,107,0.1),rgba(162,155,254,0.1))",
                    border: "1px solid rgba(162,155,254,0.25)",
                    color: "#7C6DD0",
                    borderRadius: 100,
                    padding: "3px 8px",
                  }}
                >
                  BPSC 2026
                </span>
              </div>
            </div>
          </div>

          {/* Typing row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "9px 13px",
              background: "rgba(13,13,13,0.04)",
              border: "1px solid rgba(13,13,13,0.06)",
              borderRadius: 12,
            }}
          >
            <span style={{ fontSize: 10, color: "rgba(13,13,13,0.4)" }}>
              Currently —
            </span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#0D0D0D",
                letterSpacing: "-0.01em",
              }}
            >
              {typedText}
            </span>
            <span
              className="hero-bento-cursor"
              style={{
                display: "inline-block",
                width: 2,
                height: 12,
                background: "#FF6B6B",
                borderRadius: 1,
                flexShrink: 0,
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* ── CARD 2: Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
        {[
          {
            icon: "⚡",
            val: "500+",
            lbl: "Study Hours",
            delay: 0.12,
            ibg: "rgba(255,159,67,0.15)",
            grad: "linear-gradient(135deg,#FF9F43,#FF6B6B)",
          },
          {
            icon: "🎓",
            val: "B.Ed",
            lbl: "In Progress",
            delay: 0.18,
            ibg: "rgba(162,155,254,0.15)",
            grad: "linear-gradient(135deg,#A29BFE,#FD79A8)",
          },
        ].map((s) => (
          <motion.div
            key={s.val}
            {...bentoDelay(s.delay)}
            style={{
              ...auroraGlass,
              padding: "18px 16px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: 105,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                background: s.ibg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 17,
              }}
            >
              {s.icon}
            </div>
            <div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 30,
                  lineHeight: 1,
                  letterSpacing: "-0.04em",
                  background: s.grad,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {s.val}
              </div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  color: "rgba(13,13,13,0.4)",
                  letterSpacing: "0.04em",
                  marginTop: 2,
                }}
              >
                {s.lbl}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── CARD 3: Quote ── */}
      <motion.div
        {...bentoDelay(0.25)}
        style={{
          ...auroraGlass,
          padding: "20px 20px",
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(135deg,rgba(255,107,107,0.08),rgba(162,155,254,0.08))",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -12,
            left: 12,
            fontFamily: "'Playfair Display',serif",
            fontSize: 96,
            lineHeight: 1,
            userSelect: "none",
            pointerEvents: "none",
            background:
              "linear-gradient(135deg,rgba(255,107,107,0.15),rgba(162,155,254,0.15))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          "
        </div>
        <p
          style={{
            fontFamily: "'Playfair Display',serif",
            fontStyle: "italic",
            fontSize: 16,
            lineHeight: 1.6,
            color: "#0D0D0D",
            letterSpacing: "-0.01em",
            position: "relative",
            zIndex: 1,
            marginBottom: 10,
          }}
        >
          From{" "}
          <span
            style={{
              fontStyle: "normal",
              background: "linear-gradient(135deg,#FF6B6B,#A29BFE)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Student
          </span>{" "}
          to Civil Servant —<br />
          one relentless step at a time.
        </p>
        <p
          style={{
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "rgba(13,13,13,0.35)",
          }}
        >
          — Bipin Kumar's Mission
        </p>
      </motion.div>

      {/* ── CARD 4: Identity Tags ── */}
      <motion.div
        {...bentoDelay(0.32)}
        style={{ ...auroraGlass, padding: "16px 16px" }}
      >
        <p
          style={{
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "rgba(13,13,13,0.4)",
            marginBottom: 10,
          }}
        >
          Identity
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {AURORA_TAGS.map((t) => (
            <span
              key={t.text}
              style={{
                padding: "5px 12px",
                borderRadius: 100,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "-0.01em",
                background: t.bg,
                color: t.color,
              }}
            >
              {t.text}
            </span>
          ))}
        </div>
      </motion.div>

      {/* ── CARD 5: Preparation Progress ── */}
      <motion.div
        {...bentoDelay(0.38)}
        style={{ ...auroraGlass, padding: "18px 18px" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 13,
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#0D0D0D",
            }}
          >
            Preparation Track
          </span>
          <span
            style={{
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              background: "rgba(85,239,196,0.15)",
              color: "#00B894",
              borderRadius: 100,
              padding: "3px 8px",
            }}
          >
            Active
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {AURORA_PROGRESS.map((p, i) => (
            <div key={p.label}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <span
                  style={{ fontSize: 11, fontWeight: 500, color: "#3D3535" }}
                >
                  {p.label}
                </span>
                <span
                  style={{ fontSize: 10, fontWeight: 700, color: "#0D0D0D" }}
                >
                  {p.pct}%
                </span>
              </div>
              <div
                style={{
                  height: 5,
                  background: "rgba(13,13,13,0.07)",
                  borderRadius: 100,
                  overflow: "hidden",
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${p.pct}%` }}
                  transition={{
                    duration: 1.8,
                    delay: 0.5 + i * 0.2,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  style={{
                    height: "100%",
                    borderRadius: 100,
                    background: p.grad,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── CARD 6: CTA ── */}
      <motion.a
        href="#about"
        {...bentoDelay(0.44)}
        whileTap={{ scale: 0.97 }}
        className="hero-bento-shine"
        style={{
          borderRadius: 24,
          padding: "18px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg,#0D0D0D 0%,#2D2520 100%)",
          textDecoration: "none",
          boxShadow:
            "0 2px 0 rgba(255,255,255,0.06) inset,0 20px 60px -12px rgba(13,13,13,0.4)",
        }}
      >
        <div>
          <p
            style={{
              fontSize: 9,
              fontWeight: 500,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.35)",
              marginBottom: 4,
            }}
          >
            Explore
          </p>
          <p
            style={{
              fontWeight: 800,
              fontSize: 21,
              letterSpacing: "-0.03em",
              lineHeight: 1,
              background: "linear-gradient(135deg,#FF9F43,#FF6B6B,#A29BFE)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            My Journey →
          </p>
        </div>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            color: "rgba(255,255,255,0.6)",
            flexShrink: 0,
          }}
        >
          ↗
        </div>
      </motion.a>

      {/* ── CARD 7: Connect ── */}
      <motion.div
        {...bentoDelay(0.5)}
        style={{
          ...auroraGlass,
          padding: "14px 14px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        {AURORA_LINKS.map((l) => (
          <a
            key={l.label}
            href={l.href}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                background: l.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 17,
                marginBottom: 2,
              }}
            >
              {l.icon}
            </div>
            <span
              style={{
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(13,13,13,0.4)",
              }}
            >
              {l.label}
            </span>
          </a>
        ))}
      </motion.div>
    </div>
  );
};

/* ═══════════════════════════════════════════
   MAIN HERO COMPONENT
═══════════════════════════════════════════ */
const Hero = () => {
  const { darkMode } = useTheme();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  /* Parallax transforms */
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const photoY = useTransform(scrollYProgress, [0, 1], [0, 30]);
  const photoScale = useTransform(scrollYProgress, [0, 0.6], [1, 1.04]);
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 60]);

  const typedText = useTypingEffect();
  const { greeting, isReturning } = useSmartGreeting();

  /* Mobile detection for layout changes */
  const [isMobileHero, setIsMobileHero] = useState(false);
  useEffect(() => {
    const check = () => setIsMobileHero(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  /* Mouse-based light follow */
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const smoothX = useSpring(mouseX, { stiffness: 30, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 30, damping: 20 });

  /* Pre-compute ambient light transform */
  const ambientLightBg = useTransform(
    [smoothX, smoothY],
    ([sx, sy]) =>
      `radial-gradient(ellipse 600px 500px at ${sx * 100}% ${sy * 100}%, ${
        darkMode ? "rgba(255,153,51,0.03)" : "rgba(255,153,51,0.02)"
      } 0%, transparent 70%)`,
  );

  const handleGlobalMouse = useCallback(
    (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width);
      mouseY.set((e.clientY - rect.top) / rect.height);
    },
    [mouseX, mouseY],
  );

  /* Name tilt */
  const nameRX = useMotionValue(0);
  const nameRY = useMotionValue(0);
  const sNameRX = useSpring(nameRX, { stiffness: 120, damping: 18 });
  const sNameRY = useSpring(nameRY, { stiffness: 120, damping: 18 });

  const onNameMove = useCallback(
    (e) => {
      const r = e.currentTarget.getBoundingClientRect();
      nameRX.set(((e.clientY - r.top) / r.height - 0.5) * -10);
      nameRY.set(((e.clientX - r.left) / r.width - 0.5) * 10);
    },
    [nameRX, nameRY],
  );
  const onNameLeave = useCallback(() => {
    nameRX.set(0);
    nameRY.set(0);
  }, [nameRX, nameRY]);

  /* Stagger variants */
  const stagger = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 },
    },
  };

  const fadeUp = (d = 0) => ({
    hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.9, delay: d, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  });

  /* ═══ MOBILE: Aurora Bento Full-Screen Layout ═══ */
  if (isMobileHero) {
    return (
      <section
        id="hero"
        ref={heroRef}
        className="relative w-full overflow-hidden"
      >
        <StyleInjector />
        <div className="relative pt-20 pb-10">
          <MobileHeroBento typedText={typedText} greeting={greeting} />
        </div>
      </section>
    );
  }

  return (
    <section
      id="hero"
      ref={heroRef}
      onMouseMove={handleGlobalMouse}
      className="relative min-h-screen w-full overflow-hidden"
    >
      <StyleInjector />

      {/* ═══ BACKGROUND SYSTEM ═══ */}
      <div className="absolute inset-0 z-0">
        {/* Base */}
        <div
          className={`absolute inset-0 ${darkMode ? "bg-[#060d1a]" : "bg-[#fafbfc]"}`}
        />

        {/* Mobile: Clean soft gradient background */}
        {isMobileHero && (
          <div
            className="absolute inset-0"
            style={{
              background: darkMode
                ? "radial-gradient(ellipse 120% 80% at 50% 30%, rgba(255,153,51,0.04) 0%, rgba(255,215,0,0.02) 30%, transparent 60%)"
                : "radial-gradient(ellipse 120% 80% at 50% 30%, rgba(255,153,51,0.06) 0%, rgba(255,215,0,0.03) 30%, transparent 60%)",
            }}
          />
        )}

        {/* Subtle texture image — desktop only */}
        {!isMobileHero && (
          <motion.div
            className="absolute inset-0"
            style={{
              y: bgY,
              backgroundImage: "url('/pudha_bg.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: darkMode ? 0.04 : 0.03,
              filter: "blur(1px) saturate(0.4)",
            }}
          />
        )}

        {/* Mouse-following ambient light — desktop only */}
        {!isMobileHero && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: ambientLightBg,
            }}
          />
        )}

        {/* Floating gradient orbs — desktop only */}
        {!isMobileHero && <FloatingOrbs darkMode={darkMode} />}

        {/* Edge vignette */}
        <div
          className="absolute inset-0"
          style={{
            background: darkMode
              ? isMobileHero
                ? "radial-gradient(ellipse 90% 70% at 50% 40%, transparent 50%, rgba(6,13,26,0.4) 100%)"
                : "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(6,13,26,0.6) 100%)"
              : isMobileHero
                ? "radial-gradient(ellipse 90% 70% at 50% 40%, transparent 50%, rgba(250,251,252,0.3) 100%)"
                : "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(250,251,252,0.5) 100%)",
          }}
        />

        {/* Noise texture — desktop only */}
        {!isMobileHero && <NoiseTexture />}
      </div>

      {/* ═══ CONTENT LAYOUT ═══ */}
      <div
        className={`relative z-10 min-h-screen flex flex-col lg:flex-row items-center ${isMobileHero ? "pb-20" : ""}`}
      >
        {/* ── LEFT: Content ── */}
        <motion.div
          style={{ y: isMobileHero ? 0 : contentY }}
          className={`flex-1 flex items-center justify-center lg:justify-end lg:px-14 xl:px-20 order-2 lg:order-1
            ${isMobileHero ? "px-8 pt-4 pb-6" : "px-6 sm:px-10 md:px-16 pt-28 pb-8 lg:pt-24 lg:pb-0"}`}
        >
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="w-full max-w-lg xl:max-w-xl text-center lg:text-left"
          >
            {/* Return visitor chip */}
            {isReturning && !isMobileHero && (
              <motion.span
                variants={fadeUp(0)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-body font-medium tracking-[0.15em] uppercase mb-5
                  ${
                    darkMode
                      ? "bg-white/[0.04] text-saffron/90 border border-white/[0.06]"
                      : "bg-saffron/[0.06] text-saffron-dark border border-saffron/15"
                  }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Welcome back
              </motion.span>
            )}

            {/* Greeting — upgraded for mobile */}
            <motion.p
              variants={fadeUp(0.1)}
              className={`font-body font-semibold tracking-[0.2em] uppercase
                ${isMobileHero ? "text-[11px] mb-3" : "text-xs sm:text-sm mb-6 font-medium tracking-[0.25em]"}
                ${darkMode ? "text-saffron/50" : "text-saffron/70"}`}
            >
              {isMobileHero ? `— ${greeting} —` : greeting}
            </motion.p>

            {/* ═══ NAME — Main Visual Focus ═══ */}
            <motion.div
              variants={fadeUp(0.2)}
              className={isMobileHero ? "mb-3" : "mb-6"}
            >
              {/* Desktop: GlassNameCard wrapper / Mobile: clean, no card */}
              {isMobileHero ? (
                /* ──── MOBILE: Name dominates, no glass card ──── */
                <div>
                  <h1 className="font-heading font-black leading-[0.88] tracking-[-0.04em]">
                    <span className="block text-[3.2rem] overflow-hidden">
                      {"Bipin".split("").map((char, i) => (
                        <motion.span
                          key={`bipin-${i}`}
                          initial={{ y: 60, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{
                            duration: 0.7,
                            delay: 0.3 + i * 0.05,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          className={`inline-block ${darkMode ? "text-white" : "text-navy"}`}
                        >
                          {char}
                        </motion.span>
                      ))}
                    </span>
                    <span className="block text-[3.2rem] mt-[-0.06em] overflow-hidden">
                      {"Kumar".split("").map((char, i) => (
                        <motion.span
                          key={`kumar-${i}`}
                          initial={{ y: 60, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{
                            duration: 0.8,
                            delay: 0.55 + i * 0.06,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          className="inline-block bg-gradient-to-r from-saffron via-[#FFB347] to-gold bg-clip-text text-transparent"
                        >
                          {char}
                        </motion.span>
                      ))}
                    </span>
                  </h1>
                  {/* Thin accent line */}
                  <motion.div
                    className="h-[1.5px] mt-3 rounded-full overflow-hidden w-16 mx-auto"
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{
                      duration: 1,
                      delay: 1.1,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                    style={{ transformOrigin: "center" }}
                  >
                    <div className="h-full w-full bg-gradient-to-r from-transparent via-saffron/50 to-transparent" />
                  </motion.div>
                </div>
              ) : (
                /* ──── DESKTOP: GlassNameCard stays ──── */
                <GlassNameCard darkMode={darkMode}>
                  <motion.div
                    onMouseMove={onNameMove}
                    onMouseLeave={onNameLeave}
                    style={{
                      perspective: 800,
                      rotateX: sNameRX,
                      rotateY: sNameRY,
                      transformStyle: "preserve-3d",
                    }}
                    className="cursor-default"
                  >
                    <h1 className="font-heading font-black leading-[0.92] tracking-[-0.03em]">
                      <span className="block text-[2.8rem] sm:text-5xl md:text-6xl lg:text-[4.5rem] xl:text-[5.2rem] overflow-hidden">
                        {"Bipin".split("").map((char, i) => (
                          <motion.span
                            key={`bipin-${i}`}
                            initial={{ y: 80, opacity: 0, rotateX: 40 }}
                            animate={{ y: 0, opacity: 1, rotateX: 0 }}
                            transition={{
                              duration: 0.8,
                              delay: 0.4 + i * 0.06,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                            className={`inline-block ${darkMode ? "text-white" : "text-navy"}`}
                            style={{
                              textShadow: darkMode
                                ? "0 2px 20px rgba(0,0,0,0.3)"
                                : "0 1px 10px rgba(0,0,0,0.04)",
                            }}
                          >
                            {char}
                          </motion.span>
                        ))}
                      </span>
                      <span className="block text-[2.8rem] sm:text-5xl md:text-6xl lg:text-[4.5rem] xl:text-[5.2rem] mt-[-0.08em] overflow-hidden">
                        {"Kumar".split("").map((char, i) => (
                          <motion.span
                            key={`kumar-${i}`}
                            initial={{
                              y: 80,
                              opacity: 0,
                              rotateX: 40,
                              scale: 0.8,
                            }}
                            animate={{ y: 0, opacity: 1, rotateX: 0, scale: 1 }}
                            transition={{
                              duration: 0.9,
                              delay: 0.7 + i * 0.07,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                            className="inline-block bg-gradient-to-r from-saffron via-[#FFB347] to-gold bg-clip-text text-transparent"
                            whileHover={{
                              scale: 1.15,
                              y: -4,
                              transition: {
                                type: "spring",
                                stiffness: 500,
                                damping: 15,
                              },
                            }}
                          >
                            {char}
                          </motion.span>
                        ))}
                      </span>
                    </h1>

                    {/* Accent line */}
                    <motion.div
                      className="h-[2px] mt-5 rounded-full overflow-hidden max-w-[120px]"
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: 1 }}
                      transition={{
                        duration: 1.2,
                        delay: 1.2,
                        ease: [0.25, 0.46, 0.45, 0.94],
                      }}
                      style={{ transformOrigin: "left" }}
                    >
                      <div className="h-full w-full bg-gradient-to-r from-saffron/60 via-gold/40 to-transparent" />
                    </motion.div>
                  </motion.div>
                </GlassNameCard>
              )}
            </motion.div>

            {/* Typing */}
            <motion.div
              variants={fadeUp(0.35)}
              className={`flex items-center justify-center lg:justify-start ${isMobileHero ? "mb-3 h-6" : "mb-5 h-7"}`}
            >
              <span
                className={`text-sm md:text-base font-body font-medium tracking-wide
                  ${darkMode ? "text-saffron/70" : "text-saffron/90"}`}
              >
                {typedText}
              </span>
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{
                  duration: 0.7,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
                className="inline-block w-[2px] h-[18px] ml-1 rounded-full bg-saffron/50"
              />
            </motion.div>

            {/* Role chips */}
            <motion.div
              variants={fadeUp(0.45)}
              className={`flex flex-wrap items-center gap-2 justify-center lg:justify-start ${isMobileHero ? "mb-4 gap-1.5" : "mb-6"}`}
            >
              {[
                { label: "BPSC Aspirant", c: "#FF9933" },
                { label: "Future Educator", c: "#FFD700" },
                { label: "Bihar Roots", c: "#F4A261" },
              ].map((r) => (
                <motion.span
                  key={r.label}
                  whileHover={
                    !isMobileHero
                      ? {
                          scale: 1.04,
                          y: -1,
                          transition: {
                            type: "spring",
                            stiffness: 400,
                            damping: 15,
                          },
                        }
                      : {}
                  }
                  className={`rounded-full font-body font-medium tracking-[0.1em] uppercase border backdrop-blur-sm
                    ${isMobileHero ? "px-3 py-1 text-[9px]" : "px-3.5 py-1.5 text-[10px]"}
                    ${darkMode ? "bg-white/[0.03] border-white/[0.06]" : "bg-white/40 border-white/60"}`}
                  style={{ color: `${r.c}${darkMode ? "cc" : ""}` }}
                >
                  {r.label}
                </motion.span>
              ))}
            </motion.div>

            {/* Quote — mobile: shorter */}
            <motion.p
              variants={fadeUp(0.55)}
              className={`font-serif italic leading-relaxed
                ${isMobileHero ? "text-[13px] mb-5" : "text-sm mb-7"}
                ${darkMode ? "text-gray-600" : "text-gray-400"}`}
            >
              "From{" "}
              <span
                className={`not-italic font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}
              >
                Student
              </span>{" "}
              to{" "}
              <span className="text-saffron/80 not-italic font-medium">
                Civil Servant
              </span>{" "}
              — one step at a time."
            </motion.p>

            {/* Bio card — desktop only */}
            {!isMobileHero && (
              <motion.div
                variants={fadeUp(0.65)}
                className={`rounded-2xl px-5 py-4 mb-8 border backdrop-blur-xl
                  ${
                    darkMode
                      ? "bg-white/[0.02] border-white/[0.05]"
                      : "bg-white/40 border-white/50"
                  }`}
                style={{
                  boxShadow: darkMode
                    ? "0 16px 48px -12px rgba(0,0,0,0.2)"
                    : "0 8px 32px -8px rgba(0,0,0,0.04)",
                }}
              >
                <p
                  className={`text-xs md:text-[13px] font-body leading-[1.7]
                    ${darkMode ? "text-gray-500" : "text-gray-500"}`}
                >
                  Dedicated B.Ed student committed to cracking BPSC and serving
                  Bihar. Driven by{" "}
                  <span className="text-saffron/80 font-medium">knowledge</span>
                  ,{" "}
                  <span
                    className={`font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                  >
                    perseverance
                  </span>
                  , and{" "}
                  <span className="text-gold/80 font-medium">education</span>.
                </p>
              </motion.div>
            )}

            {/* CTAs */}
            <motion.div
              variants={fadeUp(0.75)}
              className={`flex items-center lg:items-start gap-3
                ${isMobileHero ? "flex-row justify-center" : "flex-col sm:flex-row"}`}
            >
              <MagneticButton strength={6}>
                <motion.a
                  href="#about"
                  whileHover={{
                    scale: 1.03,
                    y: -1,
                    transition: { type: "spring", stiffness: 400, damping: 15 },
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-2.5 rounded-full font-heading font-semibold text-white text-sm
                    bg-gradient-to-r from-saffron to-gold inline-block transition-shadow duration-500"
                  style={{
                    boxShadow: darkMode
                      ? "0 4px 16px -4px rgba(255,153,51,0.2)"
                      : "0 4px 12px -4px rgba(255,153,51,0.15)",
                  }}
                >
                  View My Journey
                </motion.a>
              </MagneticButton>
              <MagneticButton strength={6}>
                <motion.a
                  href="#contact"
                  whileHover={{
                    scale: 1.03,
                    y: -1,
                    transition: { type: "spring", stiffness: 400, damping: 15 },
                  }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-7 py-3 rounded-full font-heading font-semibold text-sm border inline-block
                    backdrop-blur-sm transition-all duration-500
                    ${
                      darkMode
                        ? "text-white/70 border-white/[0.1] hover:border-white/[0.2] hover:bg-white/[0.03]"
                        : "text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-white/60"
                    }`}
                >
                  Let's Connect
                </motion.a>
              </MagneticButton>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════
            RIGHT: ARCHED MIRROR PHOTO
            3D pop-out with arch shape · glassmorphism badges
        ═══════════════════════════════════════════════════════ */}
        <motion.div
          style={{ y: isMobileHero ? 0 : photoY }}
          className={`relative lg:w-[48%] xl:w-[50%] lg:min-h-screen order-1 lg:order-2
            flex items-center justify-center
            ${isMobileHero ? "w-full pt-20 pb-2" : "w-full min-h-[50vh] pt-28 lg:pt-20 pb-4 sm:pb-0"}`}
        >
          <MagneticPhoto darkMode={darkMode} scrollScale={photoScale} />

          {/* Vertical label */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 2.5 }}
            className="absolute left-4 top-1/2 -translate-y-1/2 hidden lg:block"
            style={{ writingMode: "vertical-rl" }}
          >
            <span
              className={`text-[9px] font-body font-medium tracking-[0.35em] uppercase
                ${darkMode ? "text-white/10" : "text-navy/10"}`}
            >
              Portfolio — 2026
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* ═══ SCROLL INDICATOR — desktop only ═══ */}
      {!isMobileHero && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        >
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className={`w-[22px] h-[34px] rounded-full border flex justify-center pt-2
              ${darkMode ? "border-white/10" : "border-gray-300/60"}`}
          >
            <motion.div
              animate={{ opacity: [1, 0], y: [0, 8] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className={`w-[2px] h-[6px] rounded-full
                ${darkMode ? "bg-white/20" : "bg-gray-400/40"}`}
            />
          </motion.div>
          <motion.span
            className={`text-[8px] font-body tracking-[0.3em] uppercase
              ${darkMode ? "text-white/15" : "text-gray-400/60"}`}
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Scroll
          </motion.span>
        </motion.div>
      )}

      {/* ═══ BOTTOM FADE ═══ */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-32 z-[2] pointer-events-none
          ${
            darkMode
              ? "bg-gradient-to-t from-[#060d1a] via-[#060d1a]/60 to-transparent"
              : "bg-gradient-to-t from-[#fafbfc] via-[#fafbfc]/60 to-transparent"
          }`}
      />
    </section>
  );
};

export default Hero;
