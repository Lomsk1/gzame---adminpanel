import { WIKI_CATEGORY_META } from "../../features/wiki/wiki.constants";
import type { WikiCategory } from "../../types/wiki/wiki";
import { wikiCategoryLabel } from "../../i18n/domain-labels";
import { useAdminT } from "../../store/locale/locale";

export function WikiCategoryBadge({ category }: { category: WikiCategory }) {
  const { t } = useAdminT();
  const meta = WIKI_CATEGORY_META[category];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${meta.color}`}
    >
      {wikiCategoryLabel(t, category)}
    </span>
  );
}
