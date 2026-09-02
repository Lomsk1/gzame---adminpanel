import { useEffect, useRef, useState, useCallback } from "react";
import { AdminDrawerShell } from "./admin-drawer-shell";
import { AdminInput } from "../ui/input-form";
import { ButtonComponent } from "../form/button";
import {
  slugifyTitle,
  BLOG_STATUSES,
  countWords,
  estimateReadingMinutes,
  excerptFromBody,
} from "../../features/blog/blog.constants";
import type { BlogPost, BlogStatus } from "../../types/blog/blog";
import { useAdminT } from "../../store/locale/locale";
import { BlogMarkdownPreview } from "../blog/blog-markdown-preview";
import { BlogMarkdownToolbar } from "../blog/blog-markdown-toolbar";
import { BlogCoverUploadField } from "../blog/blog-cover-upload";
import { Clock, Eye, FileText, PenLine, SplitSquareHorizontal } from "lucide-react";

export type BlogFormData = {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  cover_image: string;
  coverFile: File | null;
  removeCover: boolean;
  tags: string[];
  status: BlogStatus;
  author_name: string;
};

type EditorTab = "write" | "preview" | "split";

interface Props {
  post: BlogPost | null;
  onClose: () => void;
  onSave: (data: BlogFormData) => void;
  isSubmitting?: boolean;
}

export function BlogEditorDrawer({ post, onClose, onSave, isSubmitting }: Props) {
  const { t } = useAdminT();
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!post?.slug);
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [body, setBody] = useState(post?.body ?? "");
  const [coverUrl, setCoverUrl] = useState(post?.cover_image ?? "");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverRemoved, setCoverRemoved] = useState(false);
  const [coverPreview, setCoverPreview] = useState("");
  const [tagsText, setTagsText] = useState((post?.tags ?? []).join(", "));
  const [status, setStatus] = useState<BlogStatus>(post?.status ?? "draft");
  const [authorName, setAuthorName] = useState(post?.author_name ?? "GzaMe Team");
  const [tab, setTab] = useState<EditorTab>("write");

  useEffect(() => {
    if (!slugTouched && title.trim()) {
      setSlug(slugifyTitle(title));
    }
  }, [title, slugTouched]);

  useEffect(() => {
    if (coverFile) {
      const objectUrl = URL.createObjectURL(coverFile);
      setCoverPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
    if (coverRemoved) {
      setCoverPreview("");
      return;
    }
    setCoverPreview(coverUrl);
  }, [coverFile, coverUrl, coverRemoved]);

  const wordCount = countWords(body);
  const readMin = estimateReadingMinutes(body);
  const displayExcerpt = excerpt.trim() || excerptFromBody(body);

  const handleSave = useCallback(() => {
    const tags = tagsText
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    onSave({
      title: title.trim(),
      slug: slug.trim() || slugifyTitle(title),
      excerpt: excerpt.trim() || excerptFromBody(body),
      body: body.trim(),
      cover_image: coverFile ? "" : coverRemoved ? "" : coverUrl.trim(),
      coverFile,
      removeCover: coverRemoved && !coverFile,
      tags,
      status,
      author_name: authorName.trim() || "GzaMe Team",
    });
  }, [
    title,
    slug,
    excerpt,
    body,
    coverUrl,
    coverFile,
    coverRemoved,
    tagsText,
    status,
    authorName,
    onSave,
  ]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (title.trim() && body.trim()) handleSave();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleSave, title, body]);

  const insertMarkdown = (snippet: string, cursorOffset = 0) => {
    const el = bodyRef.current;
    if (!el) {
      setBody((prev) => prev + snippet);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const next = body.slice(0, start) + snippet + body.slice(end);
    setBody(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + snippet.length + cursorOffset;
      el.setSelectionRange(pos, pos);
    });
  };

  const canSave = title.trim().length > 0 && body.trim().length > 0;
  const isEditing = Boolean(post?._id);

  const tabs: { id: EditorTab; icon: typeof PenLine; label: string }[] = [
    { id: "write", icon: PenLine, label: t("blog.editor.tabWrite") },
    { id: "preview", icon: Eye, label: t("blog.editor.tabPreview") },
    { id: "split", icon: SplitSquareHorizontal, label: t("blog.editor.tabSplit") },
  ];

  return (
    <AdminDrawerShell
      isOpen
      onClose={onClose}
      title={isEditing ? t("blog.editor.edit") : t("blog.editor.new")}
      subtitle={
        status === "published" ? t("blog.status.published") : t("blog.status.draft")
      }
      isSubmitting={isSubmitting}
      panelClassName="max-w-5xl"
      footer={
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[10px] text-admin-text-dim">
            <span className="inline-flex items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {wordCount} {t("blog.editor.words")}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {readMin} {t("blog.editor.minRead")}
              </span>
            </span>
            <span className="font-mono opacity-60">⌘S / Ctrl+S</span>
          </div>
          <ButtonComponent
            variant="oracle"
            className="w-full"
            onClick={handleSave}
            isLoading={isSubmitting}
            disabled={!canSave}
          >
            {isEditing ? t("blog.editor.save") : t("blog.editor.create")}
          </ButtonComponent>
        </div>
      }
    >
      {/* Status pills */}
      <div className="flex gap-2">
        {BLOG_STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wide border transition-all ${
              status === s
                ? s === "published"
                  ? "bg-admin-success/15 border-admin-success/40 text-admin-success"
                  : "bg-admin-warning/15 border-admin-warning/40 text-admin-warning"
                : "border-admin-border text-admin-text-dim hover:border-admin-primary/30"
            }`}
          >
            {t(s === "published" ? "blog.status.published" : "blog.status.draft")}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AdminInput
          label={t("blog.editor.title")}
          value={title}
          onChange={(v) => setTitle(String(v ?? ""))}
          placeholder={t("blog.editor.titlePh")}
        />
        <AdminInput
          label={t("blog.editor.slug")}
          value={slug}
          onChange={(v) => {
            setSlugTouched(true);
            setSlug(String(v ?? ""));
          }}
          placeholder={t("blog.editor.slugPh")}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AdminInput
          label={t("blog.editor.author")}
          value={authorName}
          onChange={(v) => setAuthorName(String(v ?? ""))}
          placeholder="GzaMe Team"
        />
      </div>

      <BlogCoverUploadField
        previewUrl={coverPreview}
        urlValue={coverUrl}
        hasPendingFile={Boolean(coverFile)}
        onFileSelect={(file) => {
          setCoverFile(file);
          setCoverRemoved(false);
        }}
        onUrlChange={(url) => {
          setCoverUrl(url);
          setCoverFile(null);
          setCoverRemoved(false);
        }}
        onClear={() => {
          setCoverFile(null);
          setCoverUrl("");
          setCoverRemoved(true);
        }}
        disabled={isSubmitting}
      />

      <AdminInput
        label={t("blog.editor.excerpt")}
        value={excerpt}
        onChange={(v) => setExcerpt(String(v ?? ""))}
        placeholder={t("blog.editor.excerptPh")}
      />

      {/* SEO preview */}
      <div className="rounded-xl border border-admin-border bg-admin-bg/30 p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-admin-text-dim mb-2">
          {t("blog.editor.seoPreview")}
        </p>
        <p className="text-xs text-[#8ab4f8] truncate">
          gzame.app/blog/{slug || "your-slug"}
        </p>
        <p className="text-sm text-[#dadce0] font-medium mt-1 line-clamp-1">
          {title || t("blog.editor.titlePh")}
        </p>
        <p className="text-xs text-[#9aa0a6] mt-1 line-clamp-2">{displayExcerpt}</p>
      </div>

      {/* Editor tabs */}
      <div className="flex gap-1 p-1 rounded-xl border border-admin-border bg-admin-bg/30">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${
              tab === id
                ? "bg-admin-primary/15 text-admin-primary"
                : "text-admin-text-dim hover:text-admin-text"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div
        className={`grid gap-4 ${
          tab === "split" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
        }`}
      >
        {(tab === "write" || tab === "split") && (
          <div className="space-y-2">
            <BlogMarkdownToolbar onInsert={insertMarkdown} />
            <textarea
              ref={bodyRef}
              className="w-full min-h-72 lg:min-h-96 bg-admin-bg/30 border border-admin-border rounded-xl p-4 text-sm text-admin-text font-mono leading-relaxed focus:outline-none focus:border-admin-primary/50 resize-y custom-scrollbar"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={t("blog.editor.bodyPh")}
            />
            <p className="text-[10px] text-admin-text-dim">{t("blog.editor.markdownHint")}</p>
          </div>
        )}

        {(tab === "preview" || tab === "split") && (
          <div className="min-h-72 lg:min-h-96 rounded-xl border border-admin-border bg-admin-panel/20 p-4 overflow-y-auto custom-scrollbar">
            {body.trim() ? (
              <BlogMarkdownPreview content={body} />
            ) : (
              <p className="text-sm text-admin-text-dim italic text-center py-12">
                {t("blog.editor.previewEmpty")}
              </p>
            )}
          </div>
        )}
      </div>

      <AdminInput
        label={t("blog.editor.tags")}
        value={tagsText}
        onChange={(v) => setTagsText(String(v ?? ""))}
        placeholder={t("blog.editor.tagsPh")}
      />
    </AdminDrawerShell>
  );
}
