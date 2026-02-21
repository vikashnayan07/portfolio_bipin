import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";
import { FaCamera, FaSave, FaSpinner } from "react-icons/fa";

const ProfileEditor = () => {
  const [profile, setProfile] = useState({
    full_name: "",
    bio: "",
    photo_url: "",
    degree: "",
    university: "",
    percentage: "",
    phone: "",
    email: "",
    location: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .limit(1)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      if (data) setProfile(data);
    } catch (err) {
      console.error("Profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `profile-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("portfolio")
        .upload(`photos/${fileName}`, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("portfolio")
        .getPublicUrl(`photos/${fileName}`);

      setProfile((prev) => ({ ...prev, photo_url: urlData.publicUrl }));
      toast.success("Photo uploaded!");
    } catch (err) {
      toast.error("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { id, created_at, updated_at, ...updateData } = profile;

      if (id) {
        const { error } = await supabase
          .from("profiles")
          .update(updateData)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("profiles").insert(updateData);
        if (error) throw error;
      }
      toast.success("Profile saved!");
      fetchProfile();
    } catch (err) {
      toast.error("Save failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-saffron border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const inputClass =
    "w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 text-sm font-body placeholder-gray-400 focus:border-saffron focus:ring-1 focus:ring-saffron/20 outline-none transition-all";
  const labelClass =
    "block text-gray-500 text-xs font-heading font-semibold mb-2 uppercase tracking-wider";

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-heading font-bold text-gray-800">Profile</h1>
        <p className="text-gray-400 text-sm font-body mt-1">
          Update your portfolio profile information
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-6">
        {/* Photo Upload */}
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 border-2 border-gray-200">
              {profile.photo_url ? (
                <img
                  src={profile.photo_url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl font-bold">
                  {profile.full_name?.charAt(0) || "B"}
                </div>
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center
                opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              {uploading ? (
                <FaSpinner className="text-gray-800 animate-spin" />
              ) : (
                <FaCamera className="text-gray-800" />
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </div>
          <div>
            <p className="text-gray-800 font-heading font-semibold text-sm">
              Profile Photo
            </p>
            <p className="text-gray-300 text-xs font-body mt-1">
              JPG, PNG, WebP. Max 5MB.
            </p>
          </div>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Full Name</label>
            <input
              name="full_name"
              value={profile.full_name}
              onChange={handleChange}
              className={inputClass}
              placeholder="Bipin Kumar"
            />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input
              name="email"
              type="email"
              value={profile.email}
              onChange={handleChange}
              className={inputClass}
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label className={labelClass}>Degree</label>
            <input
              name="degree"
              value={profile.degree}
              onChange={handleChange}
              className={inputClass}
              placeholder="B.Ed"
            />
          </div>
          <div>
            <label className={labelClass}>Percentage</label>
            <input
              name="percentage"
              type="number"
              step="0.01"
              value={profile.percentage}
              onChange={handleChange}
              className={inputClass}
              placeholder="85.50"
            />
          </div>
          <div>
            <label className={labelClass}>University</label>
            <input
              name="university"
              value={profile.university}
              onChange={handleChange}
              className={inputClass}
              placeholder="Lalit Narayan Mithila University"
            />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              className={inputClass}
              placeholder="+91 7643044297"
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Location</label>
            <input
              name="location"
              value={profile.location}
              onChange={handleChange}
              className={inputClass}
              placeholder="Bihar, India"
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Bio</label>
            <textarea
              name="bio"
              value={profile.bio}
              onChange={handleChange}
              rows={4}
              className={`${inputClass} resize-none`}
              placeholder="Tell about yourself..."
            />
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-saffron to-gold text-white text-sm
              font-heading font-bold rounded-xl hover:shadow-lg hover:shadow-saffron/25 transition-all
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditor;
