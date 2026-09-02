import {
  ExternalLink,
  Globe,
  Monitor,
  Smartphone,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";
import { BlogMarkdownPreview } from "./blog-markdown-preview";
import { formatBlogDate } from "../../features/blog/blog.constants";
import type { BlogPost } from "../../types/blog/blog";

const LANDING_URL = "https://gzame.app";

type ViewMode = "desktop" | "mobile";

type Props = {
  post: BlogPost;
  viewLiveLabel: string;
  seoPreviewLabel: string;
  copyLinkLabel: string;
  copiedLabel: string;
};

export function BlogPreviewPanel({
  post,
  viewLiveLabel,
  seoPreviewLabel,
  copyLinkLabel,
  copiedLabel,
}: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  const [copied, setCopied] = useState(false);
  const liveUrl = `${LANDING_URL}/blog/${post.slug}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(liveUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Browser chrome mock */}
      <div className="rounded-2xl border border-admin-border bg-admin-panel/40 overflow-hidden shadow-[var(--shadow-admin-lg)] flex-1 flex flex-col min-h-0">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-admin-border bg-admin-bg/40">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
          </div>
          <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-admin-panel/60 border border-admin-border text-[11px] font-mono text-admin-text-dim truncate">
            <Globe className="w-3 h-3 shrink-0 text-admin-primary/70" />
            gzame.app/blog/{post.slug}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("desktop")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "desktop"
                  ? "bg-admin-primary/15 text-admin-primary"
                  : "text-admin-text-dim hover:text-admin-text"
              }`}
              title="Desktop"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("mobile")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "mobile"
                  ? "bg-admin-primary/15 text-admin-primary"
                  : "text-admin-text-dim hover:text-admin-text"
              }`}
              title="Mobile"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-linear-to-b from-admin-bg/20 to-admin-bg/60 p-4 sm:p-6">
          <div
            className={`mx-auto transition-all duration-300 ${
              viewMode === "mobile" ? "max-w-[375px]" : "max-w-2xl"
            }`}
          >
            {post.cover_image && (
              <div className="relative rounded-2xl overflow-hidden mb-6 aspect-[21/9] border border-admin-border">
                <img
                  src={post.cover_image}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-admin-bg/80 via-transparent to-transparent" />
              </div>
            )}

            <div className="space-y-3 mb-6">
              {(post.tags ?? []).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-admin-primary/10 text-admin-primary border border-admin-primary/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <h1 className="text-2xl sm:text-3xl font-semibold text-admin-text tracking-tight leading-tight">
                {post.title}
              </h1>

              <p className="text-sm text-admin-text-dim leading-relaxed italic border-l-2 border-admin-primary/30 pl-4">
                {post.excerpt}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-admin-text-dim pt-1">
                <span className="font-medium text-admin-text">{post.author_name}</span>
                <span>·</span>
                <span>{formatBlogDate(post.published_at ?? post.created_at)}</span>
                <span>·</span>
                <span>{post.reading_time_minutes} min read</span>
              </div>
            </div>

            <BlogMarkdownPreview content={post.body} />
          </div>
        </div>
      </div>

      {/* SEO snippet + actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 shrink-0">
        <div className="rounded-xl border border-admin-border bg-admin-panel/30 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-admin-text-dim mb-2">
            {seoPreviewLabel}
          </p>
          <p className="text-sm text-[#8ab4f8] truncate">{liveUrl}</p>
          <p className="text-base text-[#dadce0] font-medium mt-1 line-clamp-1">{post.title}</p>
          <p className="text-xs text-[#9aa0a6] mt-1 line-clamp-2">{post.excerpt}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 p-4 rounded-xl border border-admin-border bg-admin-panel/30">
          {post.status === "published" && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-admin-primary/15 text-admin-primary border border-admin-primary/30 hover:bg-admin-primary/25 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {viewLiveLabel}
            </a>
          )}
          <button
            type="button"
            onClick={copyLink}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border border-admin-border text-admin-text-dim hover:text-admin-text hover:border-admin-primary/30 transition-colors"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-admin-success" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {copied ? copiedLabel : copyLinkLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
