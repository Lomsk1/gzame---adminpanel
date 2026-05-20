import { WIKI_CATEGORY_META } from "../../features/wiki/wiki.constants";
import type { WikiCategory } from "../../types/wiki/wiki";

export function WikiCategoryBadge({ category }: { category: WikiCategory }) {
  const meta = WIKI_CATEGORY_META[category];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${meta.color}`}
    >
      {meta.label}
    </span>
  );
}
