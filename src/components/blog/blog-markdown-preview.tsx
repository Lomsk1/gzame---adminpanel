import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
  content: string;
  className?: string;
};

export function BlogMarkdownPreview({ content, className = "" }: Props) {
  return (
    <div className={`blog-prose text-admin-text text-sm leading-relaxed ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h2 className="text-2xl font-semibold text-admin-text mt-8 mb-4 first:mt-0 tracking-tight">
              {children}
            </h2>
          ),
          h2: ({ children }) => (
            <h3 className="text-xl font-semibold text-admin-text mt-7 mb-3 tracking-tight">
              {children}
            </h3>
          ),
          h3: ({ children }) => (
            <h4 className="text-lg font-medium text-admin-text mt-5 mb-2">{children}</h4>
          ),
          p: ({ children }) => <p className="my-3 text-admin-text/90">{children}</p>,
          ul: ({ children }) => (
            <ul className="list-disc pl-5 my-4 space-y-1.5 text-admin-text/90">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 my-4 space-y-1.5 text-admin-text/90">{children}</ol>
          ),
          li: ({ children }) => <li>{children}</li>,
          a: ({ href, children }) => (
            <a
              href={href}
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
              className="text-admin-primary underline underline-offset-2 hover:text-admin-accent transition-colors"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-admin-primary/50 pl-4 my-5 italic text-admin-text-dim">
              {children}
            </blockquote>
          ),
          code: ({ className: codeClass, children }) => {
            const isBlock = codeClass?.includes("language-");
            if (isBlock) {
              return (
                <pre className="my-5 overflow-x-auto rounded-xl border border-admin-border bg-admin-bg/80 p-4 text-xs font-mono">
                  <code>{children}</code>
                </pre>
              );
            }
            return (
              <code className="rounded px-1.5 py-0.5 text-xs font-mono bg-admin-primary/10 text-admin-primary border border-admin-primary/20">
                {children}
              </code>
            );
          },
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt ?? ""}
              className="my-5 w-full rounded-xl border border-admin-border object-cover max-h-72"
              loading="lazy"
            />
          ),
          hr: () => <hr className="my-8 border-admin-border" />,
          strong: ({ children }) => (
            <strong className="font-semibold text-admin-text">{children}</strong>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
