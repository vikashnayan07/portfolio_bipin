import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
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
const TYPING_WORDS = ["BPSC Aspirant", "Future Educator", "Dreamer", "Bihar Roots"];

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
        ? "Good Morning"
        : h < 17
          ? "Good Afternoon"
          : h < 21
            ? "Good Evening"
            : "Hello, Night Owl"
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
        size: 300, x: "15%", y: "20%",
        color: darkMode ? "rgba(255,153,51,0.06)" : "rgba(255,153,51,0.08)",
        delay: 0, duration: 20,
      },
      {
        size: 250, x: "70%", y: "55%",
        color: darkMode ? "rgba(255,215,0,0.05)" : "rgba(255,215,0,0.06)",
        delay: 5, duration: 24,
      },
      {
        size: 200, x: "40%", y: "70%",
        color: darkMode ? "rgba(244,162,97,0.04)" : "rgba(244,162,97,0.05)",
        delay: 10, duration: 22,
      },
    ],
    [darkMode]
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {orbs.map((orb, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: orb.size, height: orb.size,
            left: orb.x, top: orb.y,
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
    [rotateX, rotateY, x, y, lightX, lightY, isMobile]
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
          rotateX: isMobile ? 0 : sRotateX,
          rotateY: isMobile ? 0 : sRotateY,
          x: isMobile ? 0 : sX,
          y: isMobile ? 0 : sY,
          transformStyle: "preserve-3d",
          scale: scrollScale,
        }}
        className="relative w-[240px] h-[320px] sm:w-[280px] sm:h-[380px] md:w-[310px] md:h-[420px] lg:w-[340px] lg:h-[460px] xl:w-[370px] xl:h-[500px]"
      >

        {/* ═══ LAYER 1: Ground shadow ═══ */}
        <div
          className="absolute hidden sm:block"
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
              opacity: isMobile ? 0 : 1,
              background: useTransform(
                [sLightX, sLightY],
                ([lx, ly]) =>
                  `radial-gradient(ellipse 60% 50% at ${lx}% ${ly}%, rgba(255,255,255,${darkMode ? 0.05 : 0.1}) 0%, transparent 70%)`
              ),
            }}
          />

          {/* Light sweep */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute inset-0 w-[35%] h-full"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)",
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
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
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
                maskImage: "linear-gradient(to bottom, black 80%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, black 80%, transparent 100%)",
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
            background: "linear-gradient(90deg, transparent, rgba(255,153,51,0.45), rgba(255,215,0,0.35), transparent)",
            filter: "blur(1px)",
          }}
        />

        {/* Floating badge — BPSC 2026 */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 1.8, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute -bottom-3 -right-1 sm:-bottom-4 sm:-right-3 z-30"
          style={{ transform: "translateZ(70px)" }}
        >
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl backdrop-blur-2xl border
              ${darkMode
                ? "bg-white/[0.06] border-white/[0.1] shadow-2xl shadow-black/30"
                : "bg-white/70 border-white/50 shadow-2xl shadow-gray-200/50"
              }`}
          >
            <span className="text-[9px] sm:text-[10px] font-heading font-bold tracking-[0.12em] uppercase bg-gradient-to-r from-saffron to-gold bg-clip-text text-transparent">
              BPSC 2026
            </span>
          </motion.div>
        </motion.div>

        {/* Top-left status badge */}
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 2.1, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute top-4 -left-1 sm:top-2 sm:-left-3 z-30"
          style={{ transform: "translateZ(65px)" }}
        >
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-2xl backdrop-blur-2xl border
              ${darkMode
                ? "bg-white/[0.06] border-white/[0.1] shadow-2xl shadow-black/30"
                : "bg-white/70 border-white/50 shadow-2xl shadow-gray-200/50"
              }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span
              className={`text-[8px] sm:text-[9px] font-body font-medium tracking-wider uppercase
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
      ${darkMode
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

  /* Mouse-based light follow */
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const smoothX = useSpring(mouseX, { stiffness: 30, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 30, damping: 20 });

  const handleGlobalMouse = useCallback(
    (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width);
      mouseY.set((e.clientY - rect.top) / rect.height);
    },
    [mouseX, mouseY]
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
    [nameRX, nameRY]
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
      opacity: 1, y: 0, filter: "blur(0px)",
      transition: { duration: 0.9, delay: d, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  });

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
        <div className={`absolute inset-0 ${darkMode ? "bg-[#060d1a]" : "bg-[#fafbfc]"}`} />

        {/* Subtle texture image */}
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

        {/* Mouse-following ambient light */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: useTransform(
              [smoothX, smoothY],
              ([sx, sy]) =>
                `radial-gradient(ellipse 600px 500px at ${sx * 100}% ${sy * 100}%, ${
                  darkMode ? "rgba(255,153,51,0.03)" : "rgba(255,153,51,0.02)"
                } 0%, transparent 70%)`
            ),
          }}
        />

        {/* Floating gradient orbs */}
        <FloatingOrbs darkMode={darkMode} />

        {/* Edge vignette */}
        <div
          className="absolute inset-0"
          style={{
            background: darkMode
              ? "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(6,13,26,0.6) 100%)"
              : "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(250,251,252,0.5) 100%)",
          }}
        />

        {/* Noise texture */}
        <NoiseTexture />
      </div>

      {/* ═══ CONTENT LAYOUT ═══ */}
      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row items-center">
        {/* ── LEFT: Content ── */}
        <motion.div
          style={{ y: contentY }}
          className="flex-1 flex items-center justify-center lg:justify-end px-6 sm:px-10 md:px-16 lg:px-14 xl:px-20
            pt-28 pb-8 lg:pt-8 lg:pb-0 order-2 lg:order-1"
        >
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="w-full max-w-lg xl:max-w-xl text-center lg:text-left"
          >
            {/* Return visitor chip */}
            {isReturning && (
              <motion.span
                variants={fadeUp(0)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-body font-medium tracking-[0.15em] uppercase mb-5
                  ${darkMode
                    ? "bg-white/[0.04] text-saffron/90 border border-white/[0.06]"
                    : "bg-saffron/[0.06] text-saffron-dark border border-saffron/15"
                  }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Welcome back
              </motion.span>
            )}

            {/* Greeting */}
            <motion.p
              variants={fadeUp(0.1)}
              className={`text-xs sm:text-sm font-body font-medium tracking-[0.25em] uppercase mb-6
                ${darkMode ? "text-gray-500" : "text-gray-400"}`}
            >
              {greeting}
            </motion.p>

            {/* ═══ GLASSMORPHISM NAME CARD ═══ */}
            <motion.div variants={fadeUp(0.2)} className="mb-6">
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
                          initial={{ y: 80, opacity: 0, rotateX: 40, scale: 0.8 }}
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
                            transition: { type: "spring", stiffness: 500, damping: 15 },
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
                    transition={{ duration: 1.2, delay: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                    style={{ transformOrigin: "left" }}
                  >
                    <div className="h-full w-full bg-gradient-to-r from-saffron/60 via-gold/40 to-transparent" />
                  </motion.div>
                </motion.div>
              </GlassNameCard>
            </motion.div>

            {/* Typing */}
            <motion.div
              variants={fadeUp(0.35)}
              className="mb-5 h-7 flex items-center justify-center lg:justify-start"
            >
              <span
                className={`text-sm md:text-base font-body font-medium tracking-wide
                  ${darkMode ? "text-saffron/70" : "text-saffron/90"}`}
              >
                {typedText}
              </span>
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.7, repeat: Infinity, repeatType: "reverse" }}
                className="inline-block w-[2px] h-[18px] ml-1 rounded-full bg-saffron/50"
              />
            </motion.div>

            {/* Role chips */}
            <motion.div
              variants={fadeUp(0.45)}
              className="flex flex-wrap items-center gap-2 mb-6 justify-center lg:justify-start"
            >
              {[
                { label: "BPSC Aspirant", c: "#FF9933" },
                { label: "Future Educator", c: "#FFD700" },
                { label: "Bihar Roots", c: "#F4A261" },
              ].map((r) => (
                <motion.span
                  key={r.label}
                  whileHover={{
                    scale: 1.04, y: -1,
                    transition: { type: "spring", stiffness: 400, damping: 15 },
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-[10px] font-body font-medium tracking-[0.1em] uppercase border backdrop-blur-sm
                    ${darkMode ? "bg-white/[0.03] border-white/[0.06]" : "bg-white/40 border-white/60"}`}
                  style={{ color: `${r.c}${darkMode ? "cc" : ""}` }}
                >
                  {r.label}
                </motion.span>
              ))}
            </motion.div>

            {/* Quote */}
            <motion.p
              variants={fadeUp(0.55)}
              className={`text-sm font-serif italic mb-7 leading-relaxed
                ${darkMode ? "text-gray-600" : "text-gray-400"}`}
            >
              "From{" "}
              <span className={`not-italic font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Student
              </span>{" "}
              to{" "}
              <span className="text-saffron/80 not-italic font-medium">
                Civil Servant
              </span>{" "}
              — one step at a time."
            </motion.p>

            {/* Bio card */}
            <motion.div
              variants={fadeUp(0.65)}
              className={`rounded-2xl px-5 py-4 mb-8 border backdrop-blur-xl
                ${darkMode
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
                <span className="text-saffron/80 font-medium">knowledge</span>,{" "}
                <span className={`font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  perseverance
                </span>
                , and{" "}
                <span className="text-gold/80 font-medium">education</span>.
              </p>
            </motion.div>

            {/* CTAs */}
            <motion.div
              variants={fadeUp(0.75)}
              className="flex flex-col sm:flex-row items-center lg:items-start gap-3"
            >
              <MagneticButton strength={6}>
                <motion.a
                  href="#about"
                  whileHover={{
                    scale: 1.03, y: -1,
                    transition: { type: "spring", stiffness: 400, damping: 15 },
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="px-7 py-3 rounded-full font-heading font-semibold text-white text-sm
                    bg-gradient-to-r from-saffron to-gold inline-block transition-shadow duration-500"
                  style={{
                    boxShadow: darkMode
                      ? "0 12px 40px -8px rgba(255,153,51,0.25)"
                      : "0 8px 30px -6px rgba(255,153,51,0.2)",
                  }}
                >
                  View My Journey
                </motion.a>
              </MagneticButton>
              <MagneticButton strength={6}>
                <motion.a
                  href="#contact"
                  whileHover={{
                    scale: 1.03, y: -1,
                    transition: { type: "spring", stiffness: 400, damping: 15 },
                  }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-7 py-3 rounded-full font-heading font-semibold text-sm border inline-block
                    backdrop-blur-sm transition-all duration-500
                    ${darkMode
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
          style={{ y: photoY }}
          className="relative w-full lg:w-[48%] xl:w-[50%] min-h-[45vh] sm:min-h-[50vh] lg:min-h-screen order-1 lg:order-2
            flex items-center justify-center pt-24 sm:pt-28 lg:pt-20 py-6 sm:py-0"
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

      {/* ═══ SCROLL INDICATOR ═══ */}
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

      {/* ═══ BOTTOM FADE ═══ */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-32 z-[2] pointer-events-none
          ${darkMode
            ? "bg-gradient-to-t from-[#060d1a] via-[#060d1a]/60 to-transparent"
            : "bg-gradient-to-t from-[#fafbfc] via-[#fafbfc]/60 to-transparent"
          }`}
      />
    </section>
  );
};

export default Hero;
