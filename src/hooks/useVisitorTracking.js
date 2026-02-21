import { useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

/**
 * Generate a persistent session ID (per browser tab session).
 * Prevents duplicate counting on page refresh within the same session.
 */
const getSessionId = () => {
  let sid = sessionStorage.getItem("bp-session-id");
  if (!sid) {
    sid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("bp-session-id", sid);
  }
  return sid;
};

/**
 * Detect device type from user agent.
 */
const getDeviceType = () => {
  const ua = navigator.userAgent.toLowerCase();
  if (/ipad|tablet|playbook|silk/i.test(ua)) return "tablet";
  if (/mobile|iphone|ipod|android.*mobile|windows phone|blackberry/i.test(ua))
    return "mobile";
  return "desktop";
};

/**
 * Simple hash of a string (for IP anonymization client-side fallback).
 */
const simpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
};

/**
 * useVisitorTracking — Tracks page visits to Supabase.
 *
 * Features:
 * - Anti-spam: Only logs once per session per page
 * - Device detection: mobile / desktop / tablet
 * - Session-based unique visitor detection
 * - Optional blog slug for blog post view tracking
 *
 * @param {Object} options
 * @param {string} options.page - Page path (default: '/')
 * @param {string} [options.blogSlug] - Blog post slug (for blog view tracking)
 * @param {boolean} [options.enabled=true] - Whether tracking is enabled
 */
const useVisitorTracking = ({
  page = "/",
  blogSlug = null,
  enabled = true,
} = {}) => {
  const tracked = useRef(false);

  useEffect(() => {
    if (!enabled || tracked.current) return;

    const trackingKey = `bp-tracked-${page}-${blogSlug || "site"}`;

    // Anti-spam: Check if this page was already tracked in this session
    if (sessionStorage.getItem(trackingKey)) {
      tracked.current = true;
      return;
    }

    const trackVisit = async () => {
      try {
        const sessionId = getSessionId();
        const deviceType = getDeviceType();
        const referrer = document.referrer || "";
        const userAgent = navigator.userAgent || "";

        // Generate a pseudo-anonymous identifier from available info
        // Real IP hashing happens server-side; this is a fallback fingerprint
        const fingerprint = simpleHash(
          `${userAgent}-${window.screen.width}x${window.screen.height}-${navigator.language}`,
        );

        const visitData = {
          page: page,
          referrer: referrer.substring(0, 500),
          user_agent: userAgent.substring(0, 500),
          ip_hash: fingerprint,
          session_id: sessionId,
          device_type: deviceType,
          blog_slug: blogSlug || null,
          is_unique: !sessionStorage.getItem("bp-session-tracked"),
        };

        const { error } = await supabase.from("visitors").insert([visitData]);

        if (error) {
          console.warn("Visitor tracking error:", error.message);
        } else {
          // Mark as tracked
          sessionStorage.setItem(trackingKey, "1");
          if (!sessionStorage.getItem("bp-session-tracked")) {
            sessionStorage.setItem("bp-session-tracked", "1");
          }
          tracked.current = true;
        }
      } catch (err) {
        // Silently fail — analytics should never break the site
        console.warn("Visitor tracking failed:", err.message);
      }
    };

    // Delay tracking slightly so it doesn't compete with critical page load
    const timer = setTimeout(trackVisit, 1500);
    return () => clearTimeout(timer);
  }, [page, blogSlug, enabled]);
};

export default useVisitorTracking;
