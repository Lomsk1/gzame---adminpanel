import type { WikiCategory } from "../types/wiki/wiki";
import type { AdminMessages } from "./translations";

export function wikiCategoryLabel(
  t: (key: keyof AdminMessages, params?: Record<string, string | number>) => string,
  category: WikiCategory,
): string {
  const key = `wiki.cat.${category}` as keyof AdminMessages;
  return t(key);
}

export function wikiCategoryDesc(
  t: (key: keyof AdminMessages, params?: Record<string, string | number>) => string,
  category: WikiCategory,
): string {
  const key = `wiki.catDesc.${category}` as keyof AdminMessages;
  return t(key);
}

export function memoryKindLabel(
  t: (key: keyof AdminMessages, params?: Record<string, string | number>) => string,
  kind: string,
): string {
  const key = `memory.kind.${kind}` as keyof AdminMessages;
  const label = t(key);
  return label === key ? kind : label;
}
