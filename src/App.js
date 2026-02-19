import React, { useState, useCallback, useEffect, lazy, Suspense } from "react";
import Lenis from "lenis";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/layout/Navbar";
import Hero from "./components/sections/Hero";
import Loader from "./components/ui/Loader";
import ScrollProgress from "./components/ui/ScrollProgress";
import CursorGlow from "./components/ui/CursorGlow";
import SectionDivider from "./components/ui/SectionDivider";
import BackToTopRocket from "./components/ui/BackToTopRocket";

/* ── Lazy-loaded sections for faster initial load ── */
const About = lazy(() => import("./components/sections/About"));
const Projects = lazy(() => import("./components/sections/Projects"));
const Skills = lazy(() => import("./components/sections/Skills"));
const Blog = lazy(() => import("./components/sections/Blog"));
const Contact = lazy(() => import("./components/sections/Contact"));
const Footer = lazy(() => import("./components/layout/Footer"));
const NoiseOverlay = lazy(() => import("./components/ui/NoiseOverlay"));
const InfiniteMarquee = lazy(() => import("./components/ui/InfiniteMarquee"));
const SpotlightEffect = lazy(() => import("./components/ui/SpotlightEffect"));
const AIChatWidget = lazy(() => import("./components/ui/AIChatWidget"));
const SectionTransition = lazy(() => import("./components/ui/SectionTransition"));
const VisitorCounter = lazy(() => import("./components/ui/VisitorCounter"));
const BiharMap = lazy(() => import("./components/sections/BiharMap"));
const AchievementToasts = lazy(() => import("./components/ui/AchievementToasts"));
const Testimonials = lazy(() => import("./components/sections/Testimonials"));
const FloatingDock = lazy(() => import("./components/ui/FloatingDock"));

function App() {
  const [loading, setLoading] = useState(true);

  const handleLoadComplete = useCallback(() => {
    setLoading(false);
  }, []);

  /* ── Lenis Smooth Scroll (optimized for mobile + desktop) ── */
  useEffect(() => {
    if (loading) return;
    const isMobile = window.innerWidth < 768;
    const lenis = new Lenis({
      duration: isMobile ? 0.8 : 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      smoothTouch: false,
      wheelMultiplier: 1,
      touchMultiplier: isMobile ? 1.5 : 2,
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, [loading]);

  return (
    <ThemeProvider>
      {/* Loading Screen */}
      {loading && <Loader onComplete={handleLoadComplete} />}

      {/* Global UI layers */}
      {!loading && (
        <Suspense fallback={null}>
          <ScrollProgress />
          <CursorGlow />
          <BackToTopRocket />
          <NoiseOverlay opacity={0.04} />
          <AIChatWidget />
          <AchievementToasts />
          <FloatingDock />
        </Suspense>
      )}

      {/* Main App */}
      <div
        className={`${loading ? "opacity-0" : "opacity-100"} transition-opacity duration-500`}
      >
        <Navbar />
        <main>
          <Hero />
          <Suspense fallback={null}>
          <SectionDivider />

          {/* Infinite Marquee — skills ticker between Hero & About */}
          <InfiniteMarquee />

          <SectionTransition variant="scale-fade">
            <SpotlightEffect>
              <About />
            </SpotlightEffect>
          </SectionTransition>

          <SectionDivider />

          <SectionTransition variant="clip-reveal" delay={0.1}>
            <Projects />
          </SectionTransition>

          <SectionDivider />

          {/* Second marquee before Skills (reverse direction) */}
          <InfiniteMarquee
            direction="right"
            speed={25}
            items={[
              "Ethics & Integrity",
              "Answer Writing",
              "Indian Constitution",
              "NCERT Foundation",
              "Mock Tests",
              "Daily Revision",
              "Current Affairs",
              "Bihar Special",
              "Lesson Planning",
              "Public Admin",
            ]}
          />

          <SectionTransition variant="rotate-in" delay={0.1}>
            <SpotlightEffect>
              <Skills />
            </SpotlightEffect>
          </SectionTransition>

          <SectionDivider />

          <SectionTransition variant="slide-up" delay={0.1}>
            <Blog />
          </SectionTransition>

          <SectionDivider />

          {/* Bihar Interactive Map */}
          <SectionTransition variant="scale-fade" delay={0.1}>
            <BiharMap />
          </SectionTransition>

          <SectionDivider />

          {/* Testimonials */}
          <SectionTransition variant="rotate-in" delay={0.1}>
            <Testimonials />
          </SectionTransition>

          <SectionDivider />

          {/* Visitor Counter — social proof */}
          <VisitorCounter />

          <SectionTransition variant="scale-fade" delay={0.1}>
            <Contact />
          </SectionTransition>
          </Suspense>
        </main>
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </div>
    </ThemeProvider>
  );
}

export default App;
