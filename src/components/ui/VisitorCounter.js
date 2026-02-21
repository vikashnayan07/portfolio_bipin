import React, { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import { supabase } from "../../lib/supabase";
import useVisitorTracking from "../../hooks/useVisitorTracking";
import { FaEye, FaGlobeAsia, FaMobileAlt, FaDesktop } from "react-icons/fa";

/* ═══════════════════════════════════════════════
   ODOMETER DIGIT ROLLER — smooth number animation
═══════════════════════════════════════════════ */
const DigitRoller = ({ digit, delay = 0, darkMode }) => (
  <div className="relative h-9 w-[1.15ch] overflow-hidden">
    <motion.div
      initial={{ y: "-100%" }}
      animate={{ y: `${-digit * 10}%` }}
      transition={{
        duration: 1.4,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="flex flex-col"
    >
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
        <span
          key={n}
          className={`h-9 flex items-center justify-center text-2xl font-heading font-extrabold tabular-nums
            ${darkMode ? "text-saffron" : "text-saffron-dark"}`}
        >
          {n}
        </span>
      ))}
    </motion.div>
  </div>
);

/* ═══════════════════════════════════════════════
   COMMA-SEPARATED NUMBER WITH ROLLERS
═══════════════════════════════════════════════ */
const AnimatedNumber = ({ value, darkMode }) => {
  const formatted = String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const chars = formatted.split("");
  let digitIndex = 0;

  return (
    <div className="flex items-center">
      {chars.map((char, i) => {
        if (char === ",") {
          return (
            <span
              key={`comma-${i}`}
              className={`text-xl font-heading font-bold mx-[1px] ${
                darkMode ? "text-gray-500" : "text-gray-400"
              }`}
            >
              ,
            </span>
          );
        }
        const idx = digitIndex++;
        return (
          <DigitRoller
            key={`d-${i}`}
            digit={parseInt(char, 10)}
            delay={idx * 0.12}
            darkMode={darkMode}
          />
        );
      })}
    </div>
  );
};

/* ═══════════════════════════════════════════════
   MINI STATS — small stat pills
═══════════════════════════════════════════════ */
const MiniStat = ({ icon: Icon, label, value, darkMode }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: 1.5 }}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-body
      ${darkMode ? "bg-white/5 text-gray-400" : "bg-gray-100 text-gray-500"}`}
  >
    <Icon className="text-saffron text-[10px]" />
    <span className="font-semibold">{value}</span>
    <span className="opacity-70">{label}</span>
  </motion.div>
);

/* ═══════════════════════════════════════════════
   MAIN VISITOR COUNTER COMPONENT
═══════════════════════════════════════════════ */
const VisitorCounter = ({ className = "" }) => {
  const { darkMode } = useTheme();
  const [visitorCount, setVisitorCount] = useState(0);
  const [stats, setStats] = useState({ mobile: 0, desktop: 0, today: 0 });
  const [isLive, setIsLive] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  // Track this visit
  useVisitorTracking({ page: "/", enabled: true });

  // Fetch visitor count from Supabase
  useEffect(() => {
    const fetchCount = async () => {
      try {
        // Try the RPC function first
        const { data: rpcData, error: rpcError } =
          await supabase.rpc("get_visitor_count");

        if (!rpcError && rpcData !== null) {
          setVisitorCount(Number(rpcData));
        } else {
          // Fallback: count directly from table
          const { count } = await supabase
            .from("visitors")
            .select("*", { count: "exact", head: true });
          setVisitorCount(count || 0);
        }

        // Get device breakdown
        const [mobileRes, desktopRes, todayRes] = await Promise.all([
          supabase
            .from("visitors")
            .select("*", { count: "exact", head: true })
            .eq("device_type", "mobile"),
          supabase
            .from("visitors")
            .select("*", { count: "exact", head: true })
            .eq("device_type", "desktop"),
          supabase
            .from("visitors")
            .select("*", { count: "exact", head: true })
            .gte("created_at", new Date().toISOString().split("T")[0]),
        ]);

        setStats({
          mobile: mobileRes.count || 0,
          desktop: desktopRes.count || 0,
          today: todayRes.count || 0,
        });

        setIsLive(true);
      } catch (err) {
        console.warn("Failed to fetch visitor count:", err);
        const fallback = parseInt(
          localStorage.getItem("bp-visitor-count") || "0",
          10,
        );
        setVisitorCount(fallback + 1247);
      }
    };

    fetchCount();
  }, []);

  // Subscribe to realtime inserts for live counter
  useEffect(() => {
    const channel = supabase
      .channel("visitors-live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "visitors" },
        () => {
          setVisitorCount((prev) => prev + 1);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Persist count locally as fallback
  useEffect(() => {
    if (visitorCount > 0) {
      localStorage.setItem("bp-visitor-count", String(visitorCount));
    }
  }, [visitorCount]);

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className={`py-12 px-4 ${className}`}
    >
      <div className="max-w-lg mx-auto text-center">
        {/* Main counter card */}
        <motion.div
          initial={{ scale: 0.95 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ delay: 0.3, duration: 0.5 }}
          className={`relative overflow-hidden rounded-3xl p-8 
            ${
              darkMode
                ? "glass border border-white/10"
                : "bg-white/80 backdrop-blur-lg border border-gray-200/50 shadow-xl shadow-gray-200/20"
            }`}
        >
          {/* Gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-saffron via-gold to-saffron" />

          {/* Live indicator */}
          <div className="flex items-center justify-center gap-2 mb-5">
            <div className="relative flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="absolute w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-75" />
            </div>
            <span
              className={`text-[11px] font-body font-semibold uppercase tracking-wider
                ${darkMode ? "text-emerald-400" : "text-emerald-500"}`}
            >
              {isLive ? "Live" : "Counting"}
            </span>
          </div>

          {/* Globe icon */}
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="flex items-center justify-center mb-4"
          >
            <FaGlobeAsia
              className={`text-3xl ${darkMode ? "text-saffron/30" : "text-saffron/20"}`}
            />
          </motion.div>

          {/* Label */}
          <p
            className={`text-xs font-body mb-2 uppercase tracking-widest
              ${darkMode ? "text-gray-500" : "text-gray-400"}`}
          >
            You're visitor
          </p>

          {/* Counter */}
          <div className="flex items-center justify-center gap-1 mb-1">
            <span
              className={`text-2xl font-heading font-extrabold mr-1
                ${darkMode ? "text-saffron" : "text-saffron-dark"}`}
            >
              #
            </span>
            {isInView && visitorCount > 0 && (
              <AnimatedNumber value={visitorCount} darkMode={darkMode} />
            )}
          </div>

          {/* Subtitle */}
          <AnimatePresence>
            {isLive && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2 }}
                className={`text-[11px] font-body mt-3
                  ${darkMode ? "text-gray-600" : "text-gray-400"}`}
              >
                Thank you for being a part of this journey ✨
              </motion.p>
            )}
          </AnimatePresence>

          {/* Mini stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 2.2 }}
            className="flex items-center justify-center gap-2 mt-5 flex-wrap"
          >
            {stats.today > 0 && (
              <MiniStat
                icon={FaEye}
                label="today"
                value={stats.today}
                darkMode={darkMode}
              />
            )}
            {stats.desktop > 0 && (
              <MiniStat
                icon={FaDesktop}
                label="desktop"
                value={stats.desktop}
                darkMode={darkMode}
              />
            )}
            {stats.mobile > 0 && (
              <MiniStat
                icon={FaMobileAlt}
                label="mobile"
                value={stats.mobile}
                darkMode={darkMode}
              />
            )}
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default VisitorCounter;
