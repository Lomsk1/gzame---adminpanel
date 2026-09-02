import { Clock, FileText, Sparkles } from "lucide-react";
import { formatBlogDate } from "../../features/blog/blog.constants";
import type { BlogPost } from "../../types/blog/blog";

type Props = {
  post: BlogPost;
  selected: boolean;
  onSelect: () => void;
  publishedLabel: string;
  draftLabel: string;
};

export function BlogPostCard({
  post,
  selected,
  onSelect,
  publishedLabel,
  draftLabel,
}: Props) {
  const isPublished = post.status === "published";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group w-full text-left rounded-2xl border overflow-hidden transition-all duration-300 ${
        selected
          ? "border-admin-primary/50 bg-admin-primary/8 shadow-[0_0_24px_-8px_rgba(var(--admin-primary-rgb),0.35)]"
          : "border-admin-border bg-admin-panel/30 hover:border-admin-primary/25 hover:bg-admin-panel/50"
      }`}
    >
      <div className="flex gap-0">
        <div
          className={`w-1 shrink-0 transition-colors ${
            isPublished ? "bg-admin-success" : "bg-admin-warning/70"
          } ${selected ? "opacity-100" : "opacity-60 group-hover:opacity-100"}`}
        />

        <div className="flex-1 min-w-0 p-4">
          <div className="flex gap-3">
            {post.cover_image ? (
              <div className="shrink-0 w-16 h-16 rounded-xl overflow-hidden border border-admin-border bg-admin-bg/50">
                <img
                  src={post.cover_image}
                  alt=""
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            ) : (
              <div className="shrink-0 w-16 h-16 rounded-xl border border-dashed border-admin-border bg-admin-bg/30 flex items-center justify-center">
                <FileText className="w-5 h-5 text-admin-text-dim/50" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                    isPublished
                      ? "text-admin-success border-admin-success/30 bg-admin-success/10"
                      : "text-admin-warning border-admin-warning/30 bg-admin-warning/10"
                  }`}
                >
                  {isPublished ? (
                    <Sparkles className="w-2.5 h-2.5" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-admin-warning animate-pulse" />
                  )}
                  {isPublished ? publishedLabel : draftLabel}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] text-admin-text-dim">
                  <Clock className="w-3 h-3" />
                  {post.reading_time_minutes} min
                </span>
              </div>

              <p className="font-semibold text-admin-text mt-1.5 truncate group-hover:text-admin-primary transition-colors">
                {post.title}
              </p>
              <p className="text-[10px] text-admin-text-dim font-mono truncate mt-0.5">
                /blog/{post.slug}
              </p>
            </div>
          </div>

          {post.excerpt && (
            <p className="text-xs text-admin-text-dim line-clamp-2 mt-3 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {(post.tags ?? []).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded-md bg-admin-primary/8 text-admin-primary/80 border border-admin-primary/15"
                >
                  {tag}
                </span>
              ))}
              {post.tags.length > 3 && (
                <span className="text-[9px] text-admin-text-dim">+{post.tags.length - 3}</span>
              )}
            </div>
          )}

          <p className="text-[10px] text-admin-text-muted mt-3">
            {formatBlogDate(post.updated_at)}
          </p>
        </div>
      </div>
    </button>
  );
}
