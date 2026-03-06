import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

/**
 * Hook to fetch the public profile from Supabase.
 * Subscribes to realtime changes so admin edits reflect instantly.
 * Falls back to defaults if no profile exists yet.
 */
const useProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .limit(1)
        .single();
      if (!error && data) {
        setProfile(data);
      }
    } catch {
      // Silently fail — will use defaults
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();

    /* ── Realtime subscription: any INSERT / UPDATE on profiles → re-fetch ── */
    const channel = supabase
      .channel("profiles-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        (payload) => {
          // Use the new row directly if available, otherwise re-fetch
          if (payload.new && Object.keys(payload.new).length > 1) {
            setProfile(payload.new);
          } else {
            fetchProfile();
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchProfile]);

  /** Allow manual refetch (e.g. after admin save) */
  const refetch = fetchProfile;

  return {
    loading,
    refetch,
    photoUrl: profile?.photo_url || "/rehman.webp",
    fullName: profile?.full_name || "Bipin Kumar",
    firstName: (profile?.full_name || "Bipin Kumar").split(" ")[0] || "Bipin",
    lastName:
      (profile?.full_name || "Bipin Kumar").split(" ").slice(1).join(" ") ||
      "Kumar",
    bio:
      profile?.bio ||
      "Dedicated B.Ed student committed to cracking BPSC and serving Bihar.",
    degree: profile?.degree || "B.Ed",
    university: profile?.university || "Lalit Narayan Mithila University",
    phone: profile?.phone || "+91 7643044297",
    email: profile?.email || "kumarbipin76211@gmail.com",
    location: profile?.location || "Bihar, India",
    percentage: profile?.percentage || "",
  };
};

export default useProfile;
