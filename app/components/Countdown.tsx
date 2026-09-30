import { useEffect, useState } from "react";

import { countdown } from "../lib/countdown";

/**
 * Big "days / hours / minutes / seconds" tiles. The server renders the first
 * value so the page never flashes empty; the browser then ticks every second.
 * The ticking numbers are hidden from screen readers, which get one steady
 * sentence instead of an announcement every second.
 */
export function Countdown({
  target,
  serverNow,
  label,
}: {
  target: number;
  serverNow: number;
  label: string;
}) {
  const [now, setNow] = useState(serverNow);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const left = countdown(now, target);
  const units = [
    { value: left.days, label: left.days === 1 ? "day" : "days" },
    { value: left.hours, label: left.hours === 1 ? "hour" : "hours" },
    { value: left.minutes, label: "min" },
    { value: left.seconds, label: "sec" },
  ];

  return (
    <div>
      <p className="sr-only">
        {left.days} days until {label}.
      </p>
      <ol aria-hidden className="grid grid-cols-4 gap-2 sm:gap-3">
        {units.map((u, i) => (
          <li
            key={i}
            className={`flex flex-col items-center rounded-2xl py-3 sm:rounded-3xl sm:py-5 ${
              i === 0 ? "bg-sun text-deep" : "bg-white/15 text-white ring-1 ring-white/25"
            }`}
          >
            <span className="font-display text-4xl leading-none font-extrabold tabular-nums sm:text-6xl">
              {i === 0 ? u.value : String(u.value).padStart(2, "0")}
            </span>
            <span className="mt-1 text-base font-bold">{u.label}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
