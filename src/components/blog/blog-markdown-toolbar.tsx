import { Bold, Heading2, Image, Link2, List, Quote } from "lucide-react";

type Props = {
  onInsert: (snippet: string, cursorOffset?: number) => void;
};

const tools: {
  icon: typeof Heading2;
  snippet: string;
  label: string;
  offset?: number;
}[] = [
  { icon: Heading2, snippet: "## Heading\n\n", label: "Heading" },
  { icon: Bold, snippet: "**bold text**", label: "Bold", offset: -2 },
  { icon: List, snippet: "- List item\n- Another item\n\n", label: "List" },
  { icon: Quote, snippet: "> Quote block\n\n", label: "Quote" },
  { icon: Link2, snippet: "[link text](https://)", label: "Link", offset: -1 },
  { icon: Image, snippet: "![alt text](https://)\n\n", label: "Image", offset: -5 },
];

export function BlogMarkdownToolbar({ onInsert }: Props) {
  return (
    <div className="flex flex-wrap gap-1 p-1 rounded-xl border border-admin-border bg-admin-bg/40">
      {tools.map(({ icon: Icon, snippet, label, offset = 0 }) => (
        <button
          key={label}
          type="button"
          title={label}
          onClick={() => onInsert(snippet, offset)}
          className="p-2 rounded-lg text-admin-text-dim hover:text-admin-primary hover:bg-admin-primary/10 transition-colors"
        >
          <Icon className="w-3.5 h-3.5" />
        </button>
      ))}
    </div>
  );
}
