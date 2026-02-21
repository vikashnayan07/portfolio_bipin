import React, { useState, useCallback, useEffect, lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Lenis from "lenis";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/layout/Navbar";
import Hero from "./components/sections/Hero";
import Loader from "./components/ui/Loader";
import ScrollProgress from "./components/ui/ScrollProgress";
import CursorGlow from "./components/ui/CursorGlow";
import SectionDivider from "./components/ui/SectionDivider";
import BackToTopRocket from "./components/ui/BackToTopRocket";
import "./styles/aurora-mobile.css";

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
const SectionTransition = lazy(
  () => import("./components/ui/SectionTransition"),
);
const VisitorCounter = lazy(() => import("./components/ui/VisitorCounter"));
const BiharMap = lazy(() => import("./components/sections/BiharMap"));
const AchievementToasts = lazy(
  () => import("./components/ui/AchievementToasts"),
);
const Testimonials = lazy(() => import("./components/sections/Testimonials"));
const FloatingDock = lazy(() => import("./components/ui/FloatingDock"));
const BlogPost = lazy(() => import("./components/sections/BlogPost"));

/* ── Admin components ── */
const AdminLogin = lazy(() => import("./components/admin/AdminLogin"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const Dashboard = lazy(() => import("./components/admin/Dashboard"));
const ProfileEditor = lazy(() => import("./components/admin/ProfileEditor"));
const ProjectsManager = lazy(
  () => import("./components/admin/ProjectsManager"),
);
const BlogManager = lazy(() => import("./components/admin/BlogManager"));
const MessagesManager = lazy(
  () => import("./components/admin/MessagesManager"),
);
const ProtectedRoute = lazy(() => import("./components/admin/ProtectedRoute"));

function App() {
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const isBlogPost = location.pathname.startsWith("/blog/");

  const handleLoadComplete = useCallback(() => {
    setLoading(false);
  }, []);

  /* ── Lenis Smooth Scroll (optimized for mobile + desktop) ── */
  useEffect(() => {
    if (loading || isAdmin) return;
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
  }, [loading, isAdmin]);

  /* ── Admin Routes ── */
  if (isAdmin) {
    return (
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#0d1f3c",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.1)",
              fontSize: "13px",
            },
          }}
        />
        <Suspense
          fallback={
            <div className="min-h-screen bg-[#0A192F] flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-saffron border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="profile" element={<ProfileEditor />} />
              <Route path="projects" element={<ProjectsManager />} />
              <Route path="blog" element={<BlogManager />} />
              <Route path="messages" element={<MessagesManager />} />
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    );
  }

  /* ── Blog Post Reader ── */
  if (isBlogPost) {
    return (
      <>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#fff",
              color: "#1a1a2e",
              border: "1px solid #e5e7eb",
              fontSize: "13px",
            },
          }}
        />
        <Suspense
          fallback={
            <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-saffron border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          <Routes>
            <Route path="/blog/:slug" element={<BlogPost />} />
          </Routes>
        </Suspense>
      </>
    );
  }

  /* ── Portfolio (public) ── */
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
          <AchievementToasts />
          <FloatingDock />
        </Suspense>
      )}

      {/* Main App */}
      <div
        className={`${loading ? "opacity-0" : "opacity-100"} transition-opacity duration-500`}
      >
        {/* Aurora Background Blobs — mobile only */}
        <div className="aurora-blob aurora-blob-1" />
        <div className="aurora-blob aurora-blob-2" />
        <div className="aurora-blob aurora-blob-3" />
        <div className="aurora-blob aurora-blob-4" />
        <div className="aurora-blob-overlay" />

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
