import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { useFetcher, useLoaderData, useRevalidator } from "react-router";
import {
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  Copy,
  Rocket,
  Archive,
  Keyboard,
} from "lucide-react";
import { ButtonComponent } from "../../components/form/button";
import {
  BlogEditorDrawer,
  type BlogFormData,
} from "../../components/drawers/blog-editor-drawer";
import { AdminConfirmWrapper } from "../../components/wrapper/wrapper";
import { toast } from "sonner";
import type { BlogPost, BlogStatus } from "../../types/blog/blog";
import type { BlogActionResponse } from "../../features/blog/blog.actions";
import { blogSaveErrorMessage, patchBlogPost, saveBlogPost } from "../../features/blog/blog.client";
import { AdminPageShell, AdminFadeUp } from "../../components/admin";
import { useAdminT } from "../../store/locale/locale";
import { BlogHero } from "../../components/blog/blog-hero";
import { BlogPostCard } from "../../components/blog/blog-post-card";
import { BlogPreviewPanel } from "../../components/blog/blog-preview-panel";
import { GlassCard } from "../../components/cards/card-glass";

type SortKey = "updated" | "title" | "published";
type StatusFilter = BlogStatus | "all";

export default function BlogPage() {
  const { t } = useAdminT();
  const { posts } = useLoaderData() as { posts: BlogPost[] };
  const fetcher = useFetcher<BlogActionResponse>();
  const revalidator = useRevalidator();
  const searchRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [duplicateSeed, setDuplicateSeed] = useState<BlogFormData | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortKey>("updated");

  const isBusy = fetcher.state !== "idle" || saving;

  useEffect(() => {
    if (fetcher.state !== "idle" || !fetcher.data) return;
    if (fetcher.data.success) {
      toast.success(fetcher.data.message);
      revalidator.revalidate();
    } else if (fetcher.data.error) {
      toast.error(fetcher.data.error || t("common.actionFailed"));
    }
    fetcher.reset();
  }, [fetcher.state, fetcher.data, revalidator, fetcher, t]);

  const stats = useMemo(() => {
    const published = posts.filter((p) => p.status === "published").length;
    const drafts = posts.filter((p) => p.status === "draft").length;
    return { total: posts.length, published, drafts };
  }, [posts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = [...posts];
    if (statusFilter !== "all") {
      list = list.filter((p) => p.status === statusFilter);
    }
    if (q) {
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          (p.tags ?? []).some((tag) => tag.toLowerCase().includes(q)),
      );
    }
    list.sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "published") {
        const da = a.published_at ? new Date(a.published_at).getTime() : 0;
        const db = b.published_at ? new Date(b.published_at).getTime() : 0;
        return db - da;
      }
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
    return list;
  }, [posts, search, statusFilter, sortBy]);

  const selected =
    filtered.find((p) => p._id === selectedId) ?? filtered[0] ?? null;

  useEffect(() => {
    if (filtered.length && !filtered.some((p) => p._id === selectedId)) {
      setSelectedId(filtered[0]!._id);
    }
  }, [filtered, selectedId]);

  const openCreate = useCallback(() => {
    setEditing(null);
    setDuplicateSeed(null);
    setDrawerOpen(true);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";

      if (e.key === "n" && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        openCreate();
      }
      if (e.key === "/" && !typing) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openCreate]);

  const openEdit = (post: BlogPost) => {
    setEditing(post);
    setDuplicateSeed(null);
    setSelectedId(post._id);
    setDrawerOpen(true);
  };

  const openDuplicate = (post: BlogPost) => {
    setEditing(null);
    setDuplicateSeed({
      title: `${post.title} (copy)`,
      slug: `${post.slug}-copy`,
      excerpt: post.excerpt,
      body: post.body,
      cover_image: post.cover_image ?? "",
      coverFile: null,
      removeCover: false,
      tags: [...(post.tags ?? [])],
      status: "draft",
      author_name: post.author_name,
    });
    setDrawerOpen(true);
  };

  const handleSave = async (data: BlogFormData) => {
    setSaving(true);
    try {
      await saveBlogPost({
        intent: editing ? "update" : "create",
        id: editing?._id,
        data,
      });
      toast.success(editing ? "Blog post updated." : "Blog post created.");
      revalidator.revalidate();
      setDrawerOpen(false);
      setEditing(null);
      setDuplicateSeed(null);
    } catch (err) {
      toast.error(blogSaveErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    fetcher.submit({ intent: "delete", id }, { method: "post" });
    if (selectedId === id) setSelectedId(null);
  };

  const togglePublish = async (post: BlogPost) => {
    const nextStatus: BlogStatus =
      post.status === "published" ? "draft" : "published";
    setSaving(true);
    try {
      await patchBlogPost(post._id, {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        body: post.body,
        cover_image: post.cover_image ?? "",
        tags: post.tags ?? [],
        status: nextStatus,
        author_name: post.author_name,
      });
      toast.success(
        nextStatus === "published" ? "Post published." : "Post unpublished.",
      );
      revalidator.revalidate();
    } catch (err) {
      toast.error(blogSaveErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const statusPills: { id: StatusFilter; label: string; count: number }[] = [
    { id: "all", label: t("blog.filter.allStatuses"), count: posts.length },
    {
      id: "published",
      label: t("blog.status.published"),
      count: stats.published,
    },
    { id: "draft", label: t("blog.status.draft"), count: stats.drafts },
  ];

  const sortOptions: { id: SortKey; label: string }[] = [
    { id: "updated", label: t("blog.sort.updated") },
    { id: "published", label: t("blog.sort.published") },
    { id: "title", label: t("blog.sort.title") },
  ];

  return (
    <AdminPageShell className="space-y-6">
      <BlogHero
        title={t("pages.blog.title")}
        subtitle={t("blog.hero.subtitle")}
        total={stats.total}
        published={stats.published}
        drafts={stats.drafts}
        totalLabel={t("blog.stats.total")}
        publishedLabel={t("blog.stats.published")}
        draftsLabel={t("blog.stats.drafts")}
        actions={
          <>
            <ButtonComponent
              variant="secondary"
              size="sm"
              className="w-auto! px-4"
              onClick={() => revalidator.revalidate()}
              isLoading={revalidator.state === "loading"}
            >
              <RefreshCw className="w-4 h-4 mr-2 inline" />
              {t("common.refresh")}
            </ButtonComponent>
            <ButtonComponent
              variant="oracle"
              size="sm"
              className="w-auto! px-5"
              onClick={openCreate}
            >
              <Plus className="w-4 h-4 mr-2 inline" />
              {t("blog.newPost")}
            </ButtonComponent>
          </>
        }
      />

      <AdminFadeUp delayMs={80}>
        <GlassCard className="p-4 sm:p-5">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-admin-text-dim pointer-events-none" />
              <input
                ref={searchRef}
                className="w-full pl-10 pr-4 py-2.5 bg-admin-panel/60 border border-admin-border rounded-xl text-sm text-admin-text outline-none focus:border-admin-primary transition-colors"
                placeholder={t("blog.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {statusPills.map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setStatusFilter(pill.id)}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    statusFilter === pill.id
                      ? "bg-admin-primary/15 border-admin-primary/40 text-admin-primary"
                      : "border-admin-border text-admin-text-dim hover:border-admin-primary/25"
                  }`}
                >
                  {pill.label}
                  <span className="tabular-nums opacity-70">{pill.count}</span>
                </button>
              ))}
            </div>

            <select
              className="px-3 py-2.5 bg-admin-panel/60 border border-admin-border rounded-xl text-xs font-semibold text-admin-text outline-none focus:border-admin-primary cursor-pointer shrink-0"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              aria-label={t("blog.filter.sortBy")}
            >
              {sortOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <p className="flex items-center gap-1.5 text-[10px] text-admin-text-muted mt-3">
            <Keyboard className="w-3 h-3" />
            {t("blog.shortcuts")}
          </p>
        </GlassCard>
      </AdminFadeUp>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 min-h-[560px]">
        <AdminFadeUp
          className="xl:col-span-4 space-y-2 max-h-[720px] overflow-y-auto custom-scrollbar pr-1"
          delayMs={120}
        >
          {filtered.length === 0 ? (
            <GlassCard className="p-10 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-br from-admin-primary/5 via-transparent to-admin-accent/5 pointer-events-none" />
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-admin-primary/10 border border-admin-primary/20 flex items-center justify-center mx-auto mb-5">
                  <Rocket className="w-8 h-8 text-admin-primary/60" />
                </div>
                <p className="text-lg font-semibold text-admin-text">
                  {t("blog.empty.title")}
                </p>
                <p className="text-sm text-admin-text-dim mt-2 mb-6 max-w-xs mx-auto leading-relaxed">
                  {t("blog.empty.hint")}
                </p>
                <ButtonComponent variant="oracle" size="sm" onClick={openCreate}>
                  {t("blog.empty.create")}
                </ButtonComponent>
              </div>
            </GlassCard>
          ) : (
            filtered.map((post, i) => (
              <div
                key={post._id}
                className="admin-stagger-item"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <BlogPostCard
                  post={post}
                  selected={selected?._id === post._id}
                  onSelect={() => setSelectedId(post._id)}
                  publishedLabel={t("blog.status.published")}
                  draftLabel={t("blog.status.draft")}
                />
              </div>
            ))
          )}
        </AdminFadeUp>

        <AdminFadeUp className="xl:col-span-8 flex flex-col min-h-0" delayMs={160}>
          {selected ? (
            <>
              <div className="flex flex-wrap items-center gap-2 mb-4 shrink-0">
                <ButtonComponent variant="secondary" size="sm" onClick={() => openEdit(selected)}>
                  <Pencil className="w-3.5 h-3.5 mr-1 inline" />
                  {t("common.edit")}
                </ButtonComponent>
                <ButtonComponent
                  variant="secondary"
                  size="sm"
                  onClick={() => togglePublish(selected)}
                  disabled={isBusy}
                >
                  {selected.status === "published" ? (
                    <>
                      <Archive className="w-3.5 h-3.5 mr-1 inline" />
                      {t("blog.unpublish")}
                    </>
                  ) : (
                    <>
                      <Rocket className="w-3.5 h-3.5 mr-1 inline" />
                      {t("blog.publish")}
                    </>
                  )}
                </ButtonComponent>
                <ButtonComponent
                  variant="secondary"
                  size="sm"
                  onClick={() => openDuplicate(selected)}
                >
                  <Copy className="w-3.5 h-3.5 mr-1 inline" />
                  {t("blog.duplicate")}
                </ButtonComponent>
                <AdminConfirmWrapper
                  title={t("blog.deleteConfirm.title")}
                  description={t("blog.deleteConfirm.desc")}
                  confirmWord="DELETE"
                  onConfirm={() => handleDelete(selected._id)}
                >
                  <ButtonComponent variant="danger" size="sm" disabled={isBusy}>
                    <Trash2 className="w-3.5 h-3.5 mr-1 inline" />
                    {t("common.delete")}
                  </ButtonComponent>
                </AdminConfirmWrapper>
              </div>

              <div className="flex-1 min-h-0">
                <BlogPreviewPanel
                  post={selected}
                  viewLiveLabel={t("blog.viewLive")}
                  seoPreviewLabel={t("blog.editor.seoPreview")}
                  copyLinkLabel={t("blog.copyLink")}
                  copiedLabel={t("blog.linkCopied")}
                />
              </div>
            </>
          ) : (
            <GlassCard className="p-10 h-full flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-2xl border border-dashed border-admin-border flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-admin-text-dim/40" />
              </div>
              <p className="text-admin-text font-medium">{t("blog.selectPost")}</p>
              <p className="text-sm text-admin-text-dim mt-2">{t("blog.selectPostHint")}</p>
            </GlassCard>
          )}
        </AdminFadeUp>
      </div>

      {drawerOpen && (
        <BlogEditorDrawer
          key={editing?._id ?? (duplicateSeed ? "dup" : "new")}
          post={
            editing ??
            (duplicateSeed
              ? ({
                  _id: "",
                  ...duplicateSeed,
                  reading_time_minutes: 0,
                  created_at: "",
                  updated_at: "",
                } as BlogPost)
              : null)
          }
          onClose={() => {
            setDrawerOpen(false);
            setEditing(null);
            setDuplicateSeed(null);
          }}
          onSave={handleSave}
          isSubmitting={isBusy}
        />
      )}
    </AdminPageShell>
  );
}
