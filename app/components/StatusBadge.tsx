import type { PoolStatus } from "../lib/pool-status";
import { CalendarIcon, CheckIcon, ClockIcon, MoonIcon } from "./icons";

// Each state has its own icon and words; color is only a supporting cue.
const look: Record<PoolStatus["state"], { icon: typeof CheckIcon; label: string; tone: string }> = {
  open: { icon: CheckIcon, label: "Open", tone: "bg-green-100 text-green-900" },
  "opens-later": { icon: ClockIcon, label: "Opening soon", tone: "bg-sky-100 text-sky-900" },
  "closed-today": { icon: MoonIcon, label: "Closed", tone: "bg-slate-100 text-slate-800" },
  preseason: { icon: CalendarIcon, label: "Off season", tone: "bg-amber-100 text-amber-900" },
  offseason: { icon: MoonIcon, label: "Off season", tone: "bg-slate-100 text-slate-800" },
};

export function StatusBadge({ status }: { status: PoolStatus }) {
  const { icon: Icon, label, tone } = look[status.state];
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <span
        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-base font-bold whitespace-nowrap ${tone}`}
      >
        <Icon className="size-5" />
        {label}
      </span>
      <span className="font-display text-xl font-extrabold text-deep">{status.headline}</span>
    </div>
  );
}
