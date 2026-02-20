import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  FaPlus,
  FaSave,
  FaTrash,
  FaTimes,
  FaSpinner,
  FaImage,
  FaEdit,
  FaEye,
  FaEyeSlash,
  FaBold,
  FaItalic,
  FaListUl,
  FaListOl,
  FaQuoteLeft,
  FaCode,
  FaLink,
  FaUndo,
  FaRedo,
  FaHeading,
  FaPenNib,
} from "react-icons/fa";
import { format } from "date-fns";

/* ── Tiptap Toolbar ── */
const EditorToolbar = ({ editor }) => {
  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt("Enter URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const btnClass = (active) =>
    `p-2 rounded-lg text-xs transition-colors ${
      active
        ? "bg-saffron/20 text-saffron"
        : "text-white/40 hover:text-white/70 hover:bg-white/5"
    }`;

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-white/5 bg-white/[0.02]">
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={btnClass(editor.isActive("heading", { level: 2 }))}
      >
        <FaHeading />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={btnClass(editor.isActive("bold"))}
      >
        <FaBold />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={btnClass(editor.isActive("italic"))}
      >
        <FaItalic />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={btnClass(editor.isActive("bulletList"))}
      >
        <FaListUl />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={btnClass(editor.isActive("orderedList"))}
      >
        <FaListOl />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={btnClass(editor.isActive("blockquote"))}
      >
        <FaQuoteLeft />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={btnClass(editor.isActive("codeBlock"))}
      >
        <FaCode />
      </button>
      <button onClick={addLink} className={btnClass(editor.isActive("link"))}>
        <FaLink />
      </button>
      <div className="w-px h-5 bg-white/10 mx-1" />
      <button
        onClick={() => editor.chain().focus().undo().run()}
        className={btnClass(false)}
      >
        <FaUndo />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        className={btnClass(false)}
      >
        <FaRedo />
      </button>
    </div>
  );
};

/* ── Blog Manager ── */
const BlogManager = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editPost, setEditPost] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const emptyPost = {
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    cover_image: "",
    is_published: false,
    tags: [],
    read_time: 1,
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExtension,
      LinkExtension.configure({ openOnClick: false }),
      Placeholder.configure({
        placeholder: "Write your blog post content here...",
      }),
    ],
    content: editPost?.content || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-invert prose-sm max-w-none px-4 py-3 min-h-[200px] focus:outline-none text-white/80 font-body",
      },
    },
    onUpdate: ({ editor }) => {
      if (editPost) {
        setEditPost((prev) => ({ ...prev, content: editor.getHTML() }));
      }
    },
  });

  // Sync editor content when editPost changes
  useEffect(() => {
    if (editor && editPost) {
      const currentContent = editor.getHTML();
      if (currentContent !== editPost.content) {
        editor.commands.setContent(editPost.content || "");
      }
    }
  }, [editPost?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `blog-${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("portfolio")
        .upload(`blog/${fileName}`, file, { upsert: true });
      if (error) throw error;

      const { data } = supabase.storage
        .from("portfolio")
        .getPublicUrl(`blog/${fileName}`);

      setEditPost((prev) => ({ ...prev, cover_image: data.publicUrl }));
      toast.success("Image uploaded!");
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!editPost.title.trim()) {
      toast.error("Title is required");
      return;
    }

    setSaving(true);
    try {
      const slug = editPost.slug || generateSlug(editPost.title);
      const { id, created_at, updated_at, views, ...saveData } = editPost;
      saveData.slug = slug;

      // Calculate read time (~200 words per minute)
      const wordCount = (saveData.content || "")
        .replace(/<[^>]*>/g, "")
        .split(/\s+/).length;
      saveData.read_time = Math.max(1, Math.ceil(wordCount / 200));

      if (id) {
        const { error } = await supabase
          .from("blog_posts")
          .update(saveData)
          .eq("id", id);
        if (error) throw error;
        toast.success("Post updated!");
      } else {
        const { error } = await supabase.from("blog_posts").insert(saveData);
        if (error) throw error;
        toast.success("Post created!");
      }

      setShowForm(false);
      setEditPost(null);
      fetchPosts();
    } catch (err) {
      toast.error("Save failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSoftDelete = async (id) => {
    if (!window.confirm("Move this post to trash?")) return;
    try {
      const { error } = await supabase
        .from("blog_posts")
        .update({ is_deleted: true })
        .eq("id", id);
      if (error) throw error;
      toast.success("Post moved to trash");
      fetchPosts();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const togglePublish = async (post) => {
    try {
      const { error } = await supabase
        .from("blog_posts")
        .update({ is_published: !post.is_published })
        .eq("id", post.id);
      if (error) throw error;
      toast.success(post.is_published ? "Post unpublished" : "Post published!");
      fetchPosts();
    } catch (err) {
      toast.error("Failed to update");
    }
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
          <h1 className="text-2xl font-heading font-bold text-white">Blog Posts</h1>
          <p className="text-white/40 text-sm font-body mt-1">
            {posts.length} post{posts.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => {
            setEditPost({ ...emptyPost });
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-saffron to-gold text-white text-sm
            font-heading font-bold rounded-xl hover:shadow-lg hover:shadow-saffron/25 transition-all"
        >
          <FaPlus className="text-xs" /> New Post
        </button>
      </div>

      {/* Editor Modal */}
      {showForm && editPost && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center pt-6 px-4 overflow-y-auto">
          <div className="bg-[#0d1f3c] border border-white/10 rounded-2xl w-full max-w-3xl p-6 mb-10 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-heading font-bold text-white">
                {editPost.id ? "Edit Post" : "New Post"}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditPost(null);
                }}
                className="text-white/40 hover:text-white"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-white/60 text-xs font-heading font-semibold mb-2 uppercase tracking-wider">
                  Title *
                </label>
                <input
                  value={editPost.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setEditPost((p) => ({
                      ...p,
                      title,
                      slug: p.id ? p.slug : generateSlug(title),
                    }));
                  }}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-body placeholder-white/30 focus:border-saffron outline-none transition-all"
                  placeholder="Post title..."
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-white/60 text-xs font-heading font-semibold mb-2 uppercase tracking-wider">
                  Slug
                </label>
                <input
                  value={editPost.slug}
                  onChange={(e) =>
                    setEditPost((p) => ({ ...p, slug: e.target.value }))
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/50 text-sm font-body placeholder-white/30 focus:border-saffron outline-none transition-all"
                  placeholder="auto-generated-slug"
                />
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-white/60 text-xs font-heading font-semibold mb-2 uppercase tracking-wider">
                  Cover Image
                </label>
                <div className="flex items-center gap-4">
                  {editPost.cover_image ? (
                    <img
                      src={editPost.cover_image}
                      alt=""
                      className="w-32 h-20 rounded-xl object-cover border border-white/10"
                    />
                  ) : (
                    <div className="w-32 h-20 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <FaImage className="text-white/20 text-xl" />
                    </div>
                  )}
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white/60 text-sm hover:bg-white/10 transition-colors"
                  >
                    {uploading ? <FaSpinner className="animate-spin" /> : "Upload"}
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

              {/* Excerpt */}
              <div>
                <label className="block text-white/60 text-xs font-heading font-semibold mb-2 uppercase tracking-wider">
                  Excerpt
                </label>
                <textarea
                  value={editPost.excerpt}
                  onChange={(e) =>
                    setEditPost((p) => ({ ...p, excerpt: e.target.value }))
                  }
                  rows={2}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-body placeholder-white/30 focus:border-saffron outline-none transition-all resize-none"
                  placeholder="Brief summary..."
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-white/60 text-xs font-heading font-semibold mb-2 uppercase tracking-wider">
                  Tags (comma-separated)
                </label>
                <input
                  value={editPost.tags?.join(", ")}
                  onChange={(e) => {
                    const tags = e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean);
                    setEditPost((p) => ({ ...p, tags }));
                  }}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-body placeholder-white/30 focus:border-saffron outline-none transition-all"
                  placeholder="BPSC, Education, Bihar"
                />
              </div>

              {/* Rich Text Editor */}
              <div>
                <label className="block text-white/60 text-xs font-heading font-semibold mb-2 uppercase tracking-wider">
                  Content
                </label>
                <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                  <EditorToolbar editor={editor} />
                  <EditorContent editor={editor} />
                </div>
              </div>

              {/* Publish toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editPost.is_published}
                  onChange={(e) =>
                    setEditPost((p) => ({
                      ...p,
                      is_published: e.target.checked,
                    }))
                  }
                  className="accent-saffron"
                />
                <span className="text-white/60 text-sm font-body">
                  Publish immediately
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditPost(null);
                }}
                className="px-4 py-2.5 text-white/40 text-sm font-body hover:text-white transition-colors"
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

      {/* Posts List */}
      {posts.length === 0 ? (
        <div className="bg-white/5 border border-white/5 rounded-2xl p-12 text-center">
          <FaPenNib className="text-white/10 text-4xl mx-auto mb-3" />
          <p className="text-white/30 text-sm font-body">
            No blog posts yet. Click "New Post" to start writing.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:border-white/10 transition-colors"
            >
              {post.cover_image ? (
                <img
                  src={post.cover_image}
                  alt=""
                  className="w-20 h-14 rounded-xl object-cover border border-white/10 flex-shrink-0"
                />
              ) : (
                <div className="w-20 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <FaPenNib className="text-white/10" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-heading font-semibold text-sm truncate">
                    {post.title}
                  </h3>
                  <span
                    className={`px-2 py-0.5 text-[9px] font-heading font-bold rounded-full flex-shrink-0 ${
                      post.is_published
                        ? "bg-green-500/15 text-green-400"
                        : "bg-white/5 text-white/30"
                    }`}
                  >
                    {post.is_published ? "Published" : "Draft"}
                  </span>
                </div>
                <p className="text-white/40 text-xs font-body mt-0.5">
                  {post.read_time} min read &middot;{" "}
                  {format(new Date(post.created_at), "MMM d, yyyy")}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => togglePublish(post)}
                  className={`p-2 rounded-lg text-sm transition-colors ${
                    post.is_published
                      ? "text-green-400/50 hover:text-green-400 hover:bg-green-500/10"
                      : "text-white/30 hover:text-white/60 hover:bg-white/5"
                  }`}
                  title={post.is_published ? "Unpublish" : "Publish"}
                >
                  {post.is_published ? <FaEye /> : <FaEyeSlash />}
                </button>
                <button
                  onClick={() => {
                    setEditPost({ ...post });
                    setShowForm(true);
                  }}
                  className="p-2 text-white/30 hover:text-saffron hover:bg-saffron/10 rounded-lg transition-colors"
                >
                  <FaEdit className="text-sm" />
                </button>
                <button
                  onClick={() => handleSoftDelete(post.id)}
                  className="p-2 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
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

export default BlogManager;
