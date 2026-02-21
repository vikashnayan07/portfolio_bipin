import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Youtube from "@tiptap/extension-youtube";
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
  FaStrikethrough,
  FaListUl,
  FaListOl,
  FaQuoteLeft,
  FaCode,
  FaLink,
  FaUndo,
  FaRedo,
  FaPenNib,
  FaYoutube,
  FaFileImage,
  FaFileAlt,
  FaMinus,
} from "react-icons/fa";
import { format } from "date-fns";

/**
 * Sanitize HTML content before loading into TipTap editor.
 * Fixes YouTube nodes with null/empty src that crash the YouTube extension.
 */
const sanitizeEditorContent = (html) => {
  if (!html) return "";
  // Remove data-youtube-video divs with missing/empty src in their iframes
  let cleaned = html.replace(
    /<div[^>]*data-youtube-video[^>]*>[\s\S]*?<\/div>/gi,
    (match) => {
      const srcMatch = match.match(/src="([^"]*)"/i);
      const src = srcMatch ? srcMatch[1] : "";
      if (!src || src === "null" || src === "undefined") {
        return ""; // Remove broken YouTube embed entirely
      }
      return match;
    },
  );
  // Also fix standalone iframes with empty src
  cleaned = cleaned.replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, (match) => {
    const srcMatch = match.match(/src="([^"]*)"/i);
    const src = srcMatch ? srcMatch[1] : "";
    if (!src || src === "null" || src === "undefined") {
      return "";
    }
    return match;
  });
  return cleaned;
};

/* ── Tiptap Toolbar ── */
const EditorToolbar = ({ editor }) => {
  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt("Enter URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addYouTube = () => {
    const url = window.prompt("Enter YouTube video URL:");
    if (url && url.trim()) {
      // Validate it looks like a YouTube URL before passing to extension
      const ytMatch = url.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/,
      );
      if (ytMatch) {
        editor.commands.setYoutubeVideo({
          src: url.trim(),
          width: 640,
          height: 360,
        });
      } else {
        alert(
          "Please enter a valid YouTube URL (e.g. https://www.youtube.com/watch?v=...)",
        );
      }
    }
  };

  const addInlineImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png,image/webp,image/gif";
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        alert("Image must be less than 5 MB");
        return;
      }
      try {
        const ext = file.name.split(".").pop();
        const fileName = `blog-inline-${Date.now()}.${ext}`;
        const { error } = await supabase.storage
          .from("portfolio")
          .upload(`blog/${fileName}`, file, { upsert: true });
        if (error) throw error;
        const { data } = supabase.storage
          .from("portfolio")
          .getPublicUrl(`blog/${fileName}`);
        editor
          .chain()
          .focus()
          .setImage({ src: data.publicUrl, alt: file.name })
          .run();
      } catch (err) {
        alert("Image upload failed: " + err.message);
      }
    };
    input.click();
  };

  const addDocument = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx";
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 10 * 1024 * 1024) {
        alert("Document must be less than 10 MB");
        return;
      }
      try {
        const ext = file.name.split(".").pop();
        const fileName = `blog-doc-${Date.now()}.${ext}`;
        const { error } = await supabase.storage
          .from("portfolio")
          .upload(`blog/${fileName}`, file, { upsert: true });
        if (error) throw error;
        const { data } = supabase.storage
          .from("portfolio")
          .getPublicUrl(`blog/${fileName}`);
        editor
          .chain()
          .focus()
          .insertContent(
            `<p><a href="${data.publicUrl}" target="_blank" rel="noopener noreferrer">📎 ${file.name}</a></p>`,
          )
          .run();
      } catch (err) {
        alert("Document upload failed: " + err.message);
      }
    };
    input.click();
  };

  const btnClass = (active) =>
    `p-2 rounded-lg text-xs transition-colors ${
      active
        ? "bg-saffron/20 text-saffron"
        : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
    }`;

  const Sep = () => <div className="w-px h-5 bg-gray-200 mx-1 flex-shrink-0" />;

  return (
    <div className="sticky top-0 z-30 flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-gray-100 bg-white/95 backdrop-blur-sm shadow-sm rounded-t-xl">
      {/* ─ Headings ─ */}
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={btnClass(editor.isActive("heading", { level: 2 }))}
        title="Heading 2"
      >
        <span className="font-heading font-bold text-[11px]">H2</span>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={btnClass(editor.isActive("heading", { level: 3 }))}
        title="Heading 3"
      >
        <span className="font-heading font-bold text-[11px]">H3</span>
      </button>

      <Sep />

      {/* ─ Text formatting ─ */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={btnClass(editor.isActive("bold"))}
        title="Bold"
      >
        <FaBold />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={btnClass(editor.isActive("italic"))}
        title="Italic"
      >
        <FaItalic />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={btnClass(editor.isActive("strike"))}
        title="Strikethrough"
      >
        <FaStrikethrough />
      </button>

      <Sep />

      {/* ─ Lists & blocks ─ */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={btnClass(editor.isActive("bulletList"))}
        title="Bullet List"
      >
        <FaListUl />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={btnClass(editor.isActive("orderedList"))}
        title="Ordered List"
      >
        <FaListOl />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={btnClass(editor.isActive("blockquote"))}
        title="Blockquote"
      >
        <FaQuoteLeft />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={btnClass(editor.isActive("codeBlock"))}
        title="Code Block"
      >
        <FaCode />
      </button>
      <button
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className={btnClass(false)}
        title="Horizontal Rule"
      >
        <FaMinus />
      </button>

      <Sep />

      {/* ─ Links ─ */}
      <button
        onClick={addLink}
        className={btnClass(editor.isActive("link"))}
        title="Insert Link"
      >
        <FaLink />
      </button>

      <Sep />

      {/* ─ Media ─ */}
      <button
        onClick={addInlineImage}
        className={btnClass(false)}
        title="Insert image"
      >
        <FaFileImage />
      </button>
      <button
        onClick={addYouTube}
        className={`${btnClass(false)} text-red-400 hover:text-red-500`}
        title="Embed YouTube video"
      >
        <FaYoutube />
      </button>
      <button
        onClick={addDocument}
        className={btnClass(false)}
        title="Attach document"
      >
        <FaFileAlt />
      </button>

      <Sep />

      {/* ─ Undo / Redo ─ */}
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className={`${btnClass(false)} disabled:opacity-30 disabled:cursor-not-allowed`}
        title="Undo"
      >
        <FaUndo />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className={`${btnClass(false)} disabled:opacity-30 disabled:cursor-not-allowed`}
        title="Redo"
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
      ImageExtension.configure({ inline: false, allowBase64: false }),
      LinkExtension.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          target: "_blank",
          rel: "noopener noreferrer",
          class: "text-saffron underline",
        },
      }),
      Youtube.configure({
        controls: true,
        nocookie: true,
        modestBranding: true,
      }),
      Placeholder.configure({
        placeholder: "Start writing your blog post...",
      }),
    ],
    content: editPost?.content ? sanitizeEditorContent(editPost.content) : "",
    editorProps: {
      attributes: {
        class:
          "prose prose-slate prose-sm max-w-none px-5 py-4 min-h-[350px] focus:outline-none text-gray-700 font-body leading-relaxed",
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
      const safeContent = sanitizeEditorContent(editPost.content || "");
      const currentContent = editor.getHTML();
      if (currentContent !== safeContent) {
        editor.commands.setContent(safeContent);
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

    /* ── Validation ── */
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, WebP, or GIF images are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5 MB");
      return;
    }

    /* ── Show local preview instantly ── */
    const previewUrl = URL.createObjectURL(file);
    setEditPost((prev) => ({
      ...prev,
      cover_image: previewUrl,
      _uploading: true,
    }));

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

      setEditPost((prev) => ({
        ...prev,
        cover_image: data.publicUrl,
        _uploading: false,
      }));
      URL.revokeObjectURL(previewUrl);
      toast.success("Image uploaded!");
    } catch (err) {
      // Revert preview on failure
      setEditPost((prev) => ({ ...prev, cover_image: "", _uploading: false }));
      URL.revokeObjectURL(previewUrl);
      toast.error("Upload failed: " + err.message);
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
      const { id, created_at, updated_at, views, _uploading, ...saveData } =
        editPost;
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
          <h1 className="text-2xl font-heading font-bold text-gray-800">
            Blog Posts
          </h1>
          <p className="text-gray-400 text-sm font-body mt-1">
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
        <div className="fixed inset-0 bg-black/30 z-50 flex items-start justify-center pt-6 px-4 overflow-y-auto">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xl w-full max-w-3xl p-6 mb-10 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-heading font-bold text-gray-800">
                {editPost.id ? "Edit Post" : "New Post"}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditPost(null);
                }}
                className="text-gray-400 hover:text-gray-800"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-gray-500 text-xs font-heading font-semibold mb-2 uppercase tracking-wider">
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
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 text-sm font-body placeholder-gray-400 focus:border-saffron outline-none transition-all"
                  placeholder="Post title..."
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-gray-500 text-xs font-heading font-semibold mb-2 uppercase tracking-wider">
                  Slug
                </label>
                <input
                  value={editPost.slug}
                  onChange={(e) =>
                    setEditPost((p) => ({ ...p, slug: e.target.value }))
                  }
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-500 text-sm font-body placeholder-gray-400 focus:border-saffron outline-none transition-all"
                  placeholder="auto-generated-slug"
                />
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-gray-500 text-xs font-heading font-semibold mb-2 uppercase tracking-wider">
                  Cover Image
                  <span className="text-gray-300 font-normal ml-2 normal-case tracking-normal">
                    JPG, PNG, WebP, GIF · Max 5 MB
                  </span>
                </label>
                <div className="flex items-center gap-4">
                  {editPost.cover_image ? (
                    <div className="relative group">
                      <img
                        src={editPost.cover_image}
                        alt=""
                        className={`w-32 h-20 rounded-xl object-cover border border-gray-200 ${
                          editPost._uploading ? "opacity-60" : ""
                        }`}
                      />
                      {editPost._uploading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <FaSpinner className="text-saffron animate-spin text-lg" />
                        </div>
                      )}
                      {!editPost._uploading && (
                        <button
                          type="button"
                          onClick={() =>
                            setEditPost((p) => ({ ...p, cover_image: "" }))
                          }
                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                        >
                          ✕
                        </button>
                      )}
                    </div>
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
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-gray-500 text-xs font-heading font-semibold mb-2 uppercase tracking-wider">
                  Excerpt
                </label>
                <textarea
                  value={editPost.excerpt}
                  onChange={(e) =>
                    setEditPost((p) => ({ ...p, excerpt: e.target.value }))
                  }
                  rows={2}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 text-sm font-body placeholder-gray-400 focus:border-saffron outline-none transition-all resize-none"
                  placeholder="Brief summary..."
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-gray-500 text-xs font-heading font-semibold mb-2 uppercase tracking-wider">
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
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 text-sm font-body placeholder-gray-400 focus:border-saffron outline-none transition-all"
                  placeholder="BPSC, Education, Bihar"
                />
              </div>

              {/* Rich Text Editor */}
              <div>
                <label className="block text-gray-500 text-xs font-heading font-semibold mb-2 uppercase tracking-wider">
                  Content
                </label>
                <div className="bg-white border border-gray-300 rounded-xl overflow-hidden relative">
                  <EditorToolbar editor={editor} />
                  <div className="max-h-[50vh] overflow-y-auto">
                    <EditorContent editor={editor} />
                  </div>
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
                <span className="text-gray-500 text-sm font-body">
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

      {/* Posts List */}
      {posts.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-12 text-center">
          <FaPenNib className="text-gray-200 text-4xl mx-auto mb-3" />
          <p className="text-gray-300 text-sm font-body">
            No blog posts yet. Click "New Post" to start writing.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 flex items-center gap-4 hover:border-gray-200 transition-colors"
            >
              {post.cover_image ? (
                <img
                  src={post.cover_image}
                  alt=""
                  className="w-20 h-14 rounded-xl object-cover border border-gray-200 flex-shrink-0"
                />
              ) : (
                <div className="w-20 h-14 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0">
                  <FaPenNib className="text-gray-200" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-gray-800 font-heading font-semibold text-sm truncate">
                    {post.title}
                  </h3>
                  <span
                    className={`px-2 py-0.5 text-[9px] font-heading font-bold rounded-full flex-shrink-0 ${
                      post.is_published
                        ? "bg-green-500/15 text-green-400"
                        : "bg-gray-50 text-gray-300"
                    }`}
                  >
                    {post.is_published ? "Published" : "Draft"}
                  </span>
                </div>
                <p className="text-gray-400 text-xs font-body mt-0.5">
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
                      : "text-gray-300 hover:text-gray-500 hover:bg-gray-50"
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
                  className="p-2 text-gray-300 hover:text-saffron hover:bg-saffron/10 rounded-lg transition-colors"
                >
                  <FaEdit className="text-sm" />
                </button>
                <button
                  onClick={() => handleSoftDelete(post.id)}
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

export default BlogManager;
