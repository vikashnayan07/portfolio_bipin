import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";
import {
  FaPlus,
  FaSave,
  FaTrash,
  FaTimes,
  FaSpinner,
  FaStar,
  FaImage,
  FaExternalLinkAlt,
  FaGithub,
  FaEdit,
  FaProjectDiagram,
} from "react-icons/fa";

const ProjectsManager = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editProject, setEditProject] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const emptyProject = {
    title: "",
    description: "",
    image_url: "",
    tech_stack: [],
    live_url: "",
    github_url: "",
    is_featured: false,
    sort_order: 0,
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("is_deleted", false)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `project-${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("portfolio")
        .upload(`projects/${fileName}`, file, { upsert: true });
      if (error) throw error;

      const { data } = supabase.storage
        .from("portfolio")
        .getPublicUrl(`projects/${fileName}`);

      setEditProject((prev) => ({ ...prev, image_url: data.publicUrl }));
      toast.success("Image uploaded!");
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!editProject.title.trim()) {
      toast.error("Title is required");
      return;
    }

    setSaving(true);
    try {
      const { id, created_at, updated_at, ...saveData } = editProject;

      if (id) {
        const { error } = await supabase
          .from("projects")
          .update(saveData)
          .eq("id", id);
        if (error) throw error;
        toast.success("Project updated!");
      } else {
        const { error } = await supabase.from("projects").insert(saveData);
        if (error) throw error;
        toast.success("Project created!");
      }

      setShowForm(false);
      setEditProject(null);
      fetchProjects();
    } catch (err) {
      toast.error("Save failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSoftDelete = async (id) => {
    if (!window.confirm("Move this project to trash?")) return;
    try {
      const { error } = await supabase
        .from("projects")
        .update({ is_deleted: true })
        .eq("id", id);
      if (error) throw error;
      toast.success("Project moved to trash");
      fetchProjects();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const handleTechStackChange = (value) => {
    const tags = value
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    setEditProject((prev) => ({ ...prev, tech_stack: tags }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-saffron border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-800">
            Projects
          </h1>
          <p className="text-gray-400 text-sm font-body mt-1">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => {
            setEditProject({ ...emptyProject });
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-saffron to-gold text-white text-sm
            font-heading font-bold rounded-xl hover:shadow-lg hover:shadow-saffron/25 transition-all"
        >
          <FaPlus className="text-xs" /> Add Project
        </button>
      </div>

      {/* Project Form Modal */}
      {showForm && editProject && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-start justify-center pt-10 px-4 overflow-y-auto">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xl w-full max-w-2xl p-6 mb-10 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-heading font-bold text-gray-800">
                {editProject.id ? "Edit Project" : "New Project"}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditProject(null);
                }}
                className="text-gray-400 hover:text-gray-800"
              >
                <FaTimes />
              </button>
            </div>

            {/* Image */}
            <div>
              <label className="block text-gray-500 text-xs font-heading font-semibold mb-2 uppercase tracking-wider">
                Cover Image
              </label>
              <div className="flex items-center gap-4">
                {editProject.image_url ? (
                  <img
                    src={editProject.image_url}
                    alt=""
                    className="w-32 h-20 rounded-xl object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-32 h-20 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center">
                    <FaImage className="text-gray-300 text-xl" />
                  </div>
                )}
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-500 text-sm hover:bg-gray-100 transition-colors"
                >
                  {uploading ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    "Upload"
                  )}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
            </div>

            {/* Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-gray-500 text-xs font-heading font-semibold mb-2 uppercase tracking-wider">
                  Title *
                </label>
                <input
                  value={editProject.title}
                  onChange={(e) =>
                    setEditProject((p) => ({ ...p, title: e.target.value }))
                  }
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 text-sm font-body placeholder-gray-400 focus:border-saffron outline-none transition-all"
                  placeholder="Project title"
                />
              </div>

              <div>
                <label className="block text-gray-500 text-xs font-heading font-semibold mb-2 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  value={editProject.description}
                  onChange={(e) =>
                    setEditProject((p) => ({
                      ...p,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 text-sm font-body placeholder-gray-400 focus:border-saffron outline-none transition-all resize-none"
                  placeholder="Brief description..."
                />
              </div>

              <div>
                <label className="block text-gray-500 text-xs font-heading font-semibold mb-2 uppercase tracking-wider">
                  Tech Stack (comma-separated)
                </label>
                <input
                  value={editProject.tech_stack?.join(", ")}
                  onChange={(e) => handleTechStackChange(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 text-sm font-body placeholder-gray-400 focus:border-saffron outline-none transition-all"
                  placeholder="React, Tailwind, Supabase"
                />
                {editProject.tech_stack?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {editProject.tech_stack.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-saffron/10 text-saffron text-[10px] font-heading font-semibold rounded-lg"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-500 text-xs font-heading font-semibold mb-2 uppercase tracking-wider">
                    Live URL
                  </label>
                  <div className="relative">
                    <FaExternalLinkAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
                    <input
                      value={editProject.live_url}
                      onChange={(e) =>
                        setEditProject((p) => ({
                          ...p,
                          live_url: e.target.value,
                        }))
                      }
                      className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 text-sm font-body placeholder-gray-400 focus:border-saffron outline-none transition-all"
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-500 text-xs font-heading font-semibold mb-2 uppercase tracking-wider">
                    GitHub URL
                  </label>
                  <div className="relative">
                    <FaGithub className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
                    <input
                      value={editProject.github_url}
                      onChange={(e) =>
                        setEditProject((p) => ({
                          ...p,
                          github_url: e.target.value,
                        }))
                      }
                      className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 text-sm font-body placeholder-gray-400 focus:border-saffron outline-none transition-all"
                      placeholder="https://github.com/..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editProject.is_featured}
                    onChange={(e) =>
                      setEditProject((p) => ({
                        ...p,
                        is_featured: e.target.checked,
                      }))
                    }
                    className="accent-saffron"
                  />
                  <span className="text-gray-500 text-sm font-body">
                    Featured
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <label className="text-gray-500 text-sm font-body">
                    Order:
                  </label>
                  <input
                    type="number"
                    value={editProject.sort_order}
                    onChange={(e) =>
                      setEditProject((p) => ({
                        ...p,
                        sort_order: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-16 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 text-sm outline-none focus:border-saffron"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditProject(null);
                }}
                className="px-4 py-2.5 text-gray-400 text-sm font-body hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-saffron to-gold text-white text-sm
                  font-heading font-bold rounded-xl hover:shadow-lg hover:shadow-saffron/25 transition-all
                  disabled:opacity-50"
              >
                {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Projects List */}
      {projects.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-12 text-center">
          <FaProjectDiagram className="text-gray-200 text-4xl mx-auto mb-3" />
          <p className="text-gray-300 text-sm font-body">
            No projects yet. Click "Add Project" to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 flex items-center gap-4 hover:border-gray-200 transition-colors"
            >
              {project.image_url ? (
                <img
                  src={project.image_url}
                  alt=""
                  className="w-20 h-14 rounded-xl object-cover border border-gray-200 flex-shrink-0"
                />
              ) : (
                <div className="w-20 h-14 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0">
                  <FaImage className="text-gray-200" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-gray-800 font-heading font-semibold text-sm truncate">
                    {project.title}
                  </h3>
                  {project.is_featured && (
                    <FaStar className="text-saffron text-xs flex-shrink-0" />
                  )}
                </div>
                <p className="text-gray-400 text-xs font-body truncate mt-0.5">
                  {project.description}
                </p>
                {project.tech_stack?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {project.tech_stack.slice(0, 4).map((t, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 bg-gray-50 text-gray-400 text-[9px] font-body rounded"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => {
                    setEditProject({ ...project });
                    setShowForm(true);
                  }}
                  className="p-2 text-gray-300 hover:text-saffron hover:bg-saffron/10 rounded-lg transition-colors"
                >
                  <FaEdit className="text-sm" />
                </button>
                <button
                  onClick={() => handleSoftDelete(project.id)}
                  className="p-2 text-gray-300 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <FaTrash className="text-sm" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsManager;
