import { useState } from "react";
import { ChevronDown, HelpCircle, BookOpen, MessageSquare, Database, Zap } from "lucide-react";
import { GlassCard } from "../cards/card-glass";
import { WIKI_CATEGORY_META, WIKI_CATEGORIES } from "../../features/wiki/wiki.constants";

export function WikiHowItWorks() {
  const [open, setOpen] = useState(false);

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
              How the LLM Wiki works
            </p>
            <p className="text-xs text-admin-text-dim mt-0.5">
              Click to {open ? "hide" : "read"} the full pipeline — admin → embedding → DEVI retrieval
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
        <div className="px-5 pb-5 pt-0 space-y-6 border-t border-admin-border/60 animate-in slide-in-from-top-2 duration-300">
          {/* Flow steps */}
          <div className="grid md:grid-cols-3 gap-4 pt-5">
            {[
              {
                icon: BookOpen,
                title: "1. You curate",
                body: "Write entries in this panel: title, body, category, tags. Set Active = on so DEVI can use them.",
              },
              {
                icon: Database,
                title: "2. Server embeds",
                body: "On save, Gemini converts title + body into a 768-dim vector stored on the entry. Use Re-embed if body changed or index was missing.",
              },
              {
                icon: MessageSquare,
                title: "3. DEVI retrieves",
                body: "When a user chats, their message is embedded and matched against active wiki entries. Top hits are injected as internal context — not shown to the user.",
              },
            ].map((step) => {
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

          {/* Wiki vs memory */}
          <div className="p-4 rounded-xl bg-admin-primary/5 border border-admin-primary/15">
            <p className="text-xs font-black text-admin-primary uppercase tracking-widest mb-3">
              Wiki vs user memory
            </p>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold text-admin-text mb-1">LLM Wiki (this page)</p>
                <ul className="text-admin-text-dim space-y-1 list-disc list-inside">
                  <li>Shared across all users</li>
                  <li>You control content manually</li>
                  <li>Psychotypes, frameworks, rules</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-admin-text mb-1">AI Memory (Memory Browser)</p>
                <ul className="text-admin-text-dim space-y-1 list-disc list-inside">
                  <li>Private per user</li>
                  <li>Auto-indexed from chat, quests, feelings</li>
                  <li>Personal history & observations</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <p className="text-xs font-black text-admin-text uppercase tracking-widest mb-3">
              Categories
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {WIKI_CATEGORIES.map((cat) => (
                <div
                  key={cat}
                  className="p-3 rounded-lg border border-admin-border bg-admin-panel/30"
                >
                  <p className="text-xs font-bold text-admin-text">
                    {WIKI_CATEGORY_META[cat].label}
                  </p>
                  <p className="text-[11px] text-admin-text-dim mt-1 leading-snug">
                    {WIKI_CATEGORY_META[cat].description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Production checklist */}
          <div className="p-4 rounded-xl border border-admin-warning/30 bg-admin-warning/5">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-admin-warning" />
              <p className="text-xs font-black text-admin-warning uppercase tracking-widest">
                Production checklist
              </p>
            </div>
            <ol className="text-sm text-admin-text-dim space-y-2 list-decimal list-inside">
              <li>
                Create Atlas vector index <code className="text-admin-primary text-xs">wiki_vector_index</code> on{" "}
                <code className="text-admin-primary text-xs">WikiEntry.embedding</code> (M10+ cluster)
              </li>
              <li>Keep entries <strong className="text-admin-text">Active</strong> and ensure <strong className="text-admin-text">Embedded</strong> timestamp is set</li>
              <li>Seed psychotypes first, then frameworks and recommendation rules</li>
              <li>Use <strong className="text-admin-text">Test wiki retrieval</strong> below with a real user question</li>
              <li>See server docs: <code className="text-admin-primary text-xs">src/model/ai/README.md</code></li>
            </ol>
          </div>

          {/* Example context block */}
          <div>
            <p className="text-xs font-black text-admin-text uppercase tracking-widest mb-2">
              What DEVI receives (example)
            </p>
            <pre className="p-4 rounded-xl bg-admin-bg border border-admin-border text-xs text-admin-text-dim font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
{`--- RELEVANT KNOWLEDGE (wiki; internal reference) ---
[psychotype] Warrior overview: Warriors respond to direct action...
[framework] Stress regulation: Use grounding before problem-solving...
--- END KNOWLEDGE ---`}
            </pre>
            <p className="text-[11px] text-admin-text-dim mt-2">
              This block is appended at runtime. The DEVI system prompt itself is never edited.
            </p>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
