import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";

type AdminDateFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  min?: string;
  max?: string;
  className?: string;
  labelClassName?: string;
};

const POPOVER_W = 280;
const POPOVER_H = 320;

function parseYmd(value: string): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = parseISO(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function isDisabledDay(day: Date, min?: string, max?: string): boolean {
  const minD = min ? parseYmd(min) : null;
  const maxD = max ? parseYmd(max) : null;
  if (minD && day < minD) return true;
  if (maxD && day > maxD) return true;
  return false;
}

function computePopoverPosition(trigger: HTMLElement) {
  const rect = trigger.getBoundingClientRect();
  const gap = 8;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let left = rect.left;
  if (left + POPOVER_W > vw - 12) left = Math.max(12, vw - POPOVER_W - 12);

  const spaceBelow = vh - rect.bottom - gap;
  const openAbove = spaceBelow < POPOVER_H && rect.top > POPOVER_H + gap;

  const top = openAbove ? rect.top - POPOVER_H - gap : rect.bottom + gap;

  return { top: Math.max(8, top), left };
}

export function AdminDateField({
  label,
  value,
  onChange,
  placeholder = "—",
  min,
  max,
  className = "",
  labelClassName = "text-[10px] font-black text-admin-text-dim uppercase tracking-wider block mb-1.5",
}: AdminDateFieldProps) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const selected = parseYmd(value);
  const [viewMonth, setViewMonth] = useState(() => selected ?? new Date());

  useEffect(() => {
    if (selected) setViewMonth(selected);
  }, [value]);

  const updatePosition = () => {
    if (!triggerRef.current) return;
    setCoords(computePopoverPosition(triggerRef.current));
  };

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      if (rootRef.current?.contains(target) || popoverRef.current?.contains(target)) return;
      setOpen(false);
    };

    const onScrollOrResize = () => updatePosition();

    document.addEventListener("mousedown", onDoc);
    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("scroll", onScrollOrResize, true);

    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("scroll", onScrollOrResize, true);
    };
  }, [open]);

  const monthStart = startOfMonth(viewMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(viewMonth), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const display = selected ? format(selected, "dd MMM yyyy") : "";

  const pickDay = (day: Date) => {
    if (isDisabledDay(day, min, max)) return;
    onChange(format(day, "yyyy-MM-dd"));
    setOpen(false);
  };

  const popover =
    open && typeof document !== "undefined"
      ? createPortal(
          <>
            <div
              className="fixed inset-0 z-[9998]"
              aria-hidden
              onClick={() => setOpen(false)}
            />
            <div
              ref={popoverRef}
              role="dialog"
              aria-modal="true"
              aria-label={label}
              style={{ top: coords.top, left: coords.left, width: POPOVER_W }}
              className="fixed z-[9999] rounded-2xl border border-admin-border bg-[#12141c] p-3 shadow-2xl ring-1 ring-black/40 admin-scale-in"
            >
              <div className="mb-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setViewMonth((m) => subMonths(m, 1))}
                  className="rounded-lg p-1.5 text-admin-text-dim hover:bg-admin-bg hover:text-admin-text"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-bold uppercase tracking-wide text-admin-text">
                  {format(viewMonth, "MMMM yyyy")}
                </span>
                <button
                  type="button"
                  onClick={() => setViewMonth((m) => addMonths(m, 1))}
                  className="rounded-lg p-1.5 text-admin-text-dim hover:bg-admin-bg hover:text-admin-text"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-1 grid grid-cols-7 gap-0.5 text-center">
                {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
                  <span key={d} className="py-1 text-[9px] font-bold uppercase text-admin-text-dim">
                    {d}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-0.5">
                {days.map((day) => {
                  const inMonth = isSameMonth(day, viewMonth);
                  const disabled = isDisabledDay(day, min, max);
                  const selectedDay = selected && isSameDay(day, selected);
                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      disabled={disabled}
                      onClick={() => pickDay(day)}
                      className={`aspect-square rounded-lg text-xs font-semibold transition-colors ${
                        disabled
                          ? "cursor-not-allowed opacity-30"
                          : selectedDay
                            ? "bg-admin-primary text-admin-bg shadow-sm"
                            : isToday(day)
                              ? "border border-admin-primary/50 text-admin-primary hover:bg-admin-primary/15"
                              : inMonth
                                ? "text-admin-text hover:bg-admin-primary/10"
                                : "text-admin-text-dim/50 hover:bg-admin-bg/80"
                      }`}
                    >
                      {format(day, "d")}
                    </button>
                  );
                })}
              </div>
            </div>
          </>,
          document.body,
        )
      : null;

  return (
    <div ref={rootRef} className={`min-w-[9.5rem] ${className}`}>
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>
      <div className="flex items-stretch gap-1">
        <button
          id={id}
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={`flex flex-1 items-center gap-2 rounded-xl border bg-admin-bg px-3 py-2.5 text-left text-sm transition-colors outline-none focus:border-admin-primary focus:ring-2 focus:ring-admin-primary/20 ${
            open ? "border-admin-primary" : "border-admin-border hover:border-admin-primary/40"
          }`}
        >
          <Calendar className="h-4 w-4 shrink-0 text-admin-primary/80" />
          <span className={display ? "text-admin-text font-medium" : "text-admin-text-dim"}>
            {display || placeholder}
          </span>
        </button>
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="rounded-xl border border-admin-border px-2.5 text-admin-text-dim hover:border-admin-error/40 hover:text-admin-error transition-colors"
            aria-label="Clear"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      {popover}
    </div>
  );
}
