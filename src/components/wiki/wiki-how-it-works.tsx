import { useState } from "react";
import { ChevronDown, HelpCircle, BookOpen, MessageSquare, Database, Zap } from "lucide-react";
import { GlassCard } from "../cards/card-glass";
import { WIKI_CATEGORIES } from "../../features/wiki/wiki.constants";
import { wikiCategoryDesc, wikiCategoryLabel } from "../../i18n/domain-labels";
import { useAdminT } from "../../store/locale/locale";

export function WikiHowItWorks() {
  const { t } = useAdminT();
  const [open, setOpen] = useState(false);

  const steps = [
    {
      icon: BookOpen,
      title: t("wiki.how.step1Title"),
      body: t("wiki.how.step1Body"),
    },
    {
      icon: Database,
      title: t("wiki.how.step2Title"),
      body: t("wiki.how.step2Body"),
    },
    {
      icon: MessageSquare,
      title: t("wiki.how.step3Title"),
      body: t("wiki.how.step3Body"),
    },
  ];

  const wikiBullets = [
    t("wiki.how.wikiBullet1"),
    t("wiki.how.wikiBullet2"),
    t("wiki.how.wikiBullet3"),
  ];

  const memoryBullets = [
    t("wiki.how.memoryBullet1"),
    t("wiki.how.memoryBullet2"),
    t("wiki.how.memoryBullet3"),
  ];

  const checklist = [
    t("wiki.how.checklist1"),
    t("wiki.how.checklist2"),
    t("wiki.how.checklist3"),
    t("wiki.how.checklist4"),
    t("wiki.how.checklist5"),
  ];

  return (
    <GlassCard className="overflow-hidden border-admin-primary/20">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-admin-primary/5 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-admin-primary/10 border border-admin-primary/20 flex items-center justify-center shrink-0">
            <HelpCircle className="w-5 h-5 text-admin-primary" />
          </div>
          <div>
            <p className="text-sm font-black text-admin-text uppercase tracking-wide">
              {t("wiki.how.title")}
            </p>
            <p className="text-xs text-admin-text-dim mt-0.5">
              {open ? t("wiki.how.toggleHide") : t("wiki.how.toggleRead")}
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-admin-primary shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="px-5 pb-5 pt-0 space-y-6 border-t border-admin-border/60 admin-fade-up">
          <div className="grid md:grid-cols-3 gap-4 pt-5">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="p-4 rounded-xl bg-admin-bg/60 border border-admin-border"
                >
                  <Icon className="w-5 h-5 text-admin-primary mb-2" />
                  <p className="text-xs font-bold text-admin-text uppercase tracking-wider mb-1">
                    {step.title}
                  </p>
                  <p className="text-sm text-admin-text-dim leading-relaxed">{step.body}</p>
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-xl bg-admin-primary/5 border border-admin-primary/15">
            <p className="text-xs font-black text-admin-primary uppercase tracking-widest mb-3">
              {t("wiki.how.vsTitle")}
            </p>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold text-admin-text mb-1">{t("wiki.how.wikiSide")}</p>
                <ul className="text-admin-text-dim space-y-1 list-disc list-inside">
                  {wikiBullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-admin-text mb-1">{t("wiki.how.memorySide")}</p>
                <ul className="text-admin-text-dim space-y-1 list-disc list-inside">
                  {memoryBullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-black text-admin-text uppercase tracking-widest mb-3">
              {t("wiki.how.categoriesTitle")}
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {WIKI_CATEGORIES.map((cat) => (
                <div
                  key={cat}
                  className="p-3 rounded-lg border border-admin-border bg-admin-panel/30"
                >
                  <p className="text-xs font-bold text-admin-text">
                    {wikiCategoryLabel(t, cat)}
                  </p>
                  <p className="text-[11px] text-admin-text-dim mt-1 leading-snug">
                    {wikiCategoryDesc(t, cat)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-admin-warning/30 bg-admin-warning/5">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-admin-warning" />
              <p className="text-xs font-black text-admin-warning uppercase tracking-widest">
                {t("wiki.how.checklistTitle")}
              </p>
            </div>
            <ol className="text-sm text-admin-text-dim space-y-2 list-decimal list-inside">
              {checklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </div>

          <div>
            <p className="text-xs font-black text-admin-text uppercase tracking-widest mb-2">
              {t("wiki.how.exampleTitle")}
            </p>
            <pre className="p-4 rounded-xl bg-admin-bg border border-admin-border text-xs text-admin-text-dim font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
{`--- RELEVANT KNOWLEDGE (wiki; internal reference) ---
[psychotype] Warrior overview: Warriors respond to direct action...
[framework] Stress regulation: Use grounding before problem-solving...
--- END KNOWLEDGE ---`}
            </pre>
            <p className="text-[11px] text-admin-text-dim mt-2">
              {t("wiki.how.exampleNote")}
            </p>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
