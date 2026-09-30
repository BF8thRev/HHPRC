import type { ReactNode } from "react";
import { Link } from "react-router";

import { ArrowIcon } from "./icons";

export function PageHeader({
  title,
  intro,
  image,
}: {
  title: string;
  intro?: ReactNode;
  /** Optional photo shown behind the title. Decorative. */
  image?: string;
}) {
  return (
    <div className="relative overflow-hidden bg-lagoon text-white">
      {image && (
        <img
          src={image}
          alt=""
          className="absolute inset-0 size-full object-cover opacity-80"
          decoding="async"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-lagoon/95 via-lagoon/70 to-lagoon/15" />
      <div className="relative mx-auto max-w-6xl px-4 pt-12 pb-20 sm:pt-16">
        <h1 className="font-display text-4xl font-extrabold sm:text-5xl">{title}</h1>
        {intro && <p className="mt-3 max-w-2xl text-lg text-sky-50">{intro}</p>}
      </div>
      <Waves />
    </div>
  );
}

export function Section({
  title,
  eyebrow,
  children,
  action,
  id,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  action?: { label: string; to: string };
  id?: string;
}) {
  return (
    <section id={id} className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-14">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          {eyebrow && <p className="font-display font-bold text-coral-text">{eyebrow}</p>}
          <h2 className="font-display text-3xl font-extrabold">{title}</h2>
        </div>
        {action && <TextLink to={action.to}>{action.label}</TextLink>}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl bg-white p-6 shadow-soft ring-1 ring-deep/5 ${className}`}>
      {children}
    </div>
  );
}

export function TextLink({ to, children }: { to: string; children: ReactNode }) {
  const className =
    "inline-flex items-center gap-1 font-semibold text-pool-text underline decoration-2 underline-offset-4 hover:text-deep";
  // Email, other sites and files (like /meeting.ics) need a real page load.
  const plain = to.startsWith("mailto:") || to.startsWith("http") || /\.\w+$/.test(to);
  return plain ? (
    <a href={to} className={className}>
      {children}
      <ArrowIcon className="size-4" />
    </a>
  ) : (
    <Link to={to} className={className}>
      {children}
      <ArrowIcon className="size-4" />
    </Link>
  );
}

/** A little tear-off calendar page: "Feb / 26 / Fri". With `monthOnly`, just the month. */
export function DateTile({
  month,
  day,
  weekday,
  monthOnly = false,
  className = "",
}: {
  month: string;
  day: number;
  weekday: string;
  monthOnly?: boolean;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`flex w-20 shrink-0 flex-col overflow-hidden rounded-2xl bg-white text-center shadow-sm ring-1 ring-deep/10 ${className}`}
    >
      <span className="bg-coral-text py-0.5 text-base font-bold text-white">
        {monthOnly ? "Month" : month}
      </span>
      {monthOnly ? (
        <span className="grid flex-1 place-items-center py-2 font-display text-2xl font-extrabold text-deep">
          {month}
        </span>
      ) : (
        <>
          <span className="font-display text-3xl leading-tight font-extrabold text-deep">
            {day}
          </span>
          <span className="pb-1 text-base font-semibold text-slate-700">{weekday}</span>
        </>
      )}
    </div>
  );
}

export function Waves({ className = "text-foam" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={`absolute inset-x-0 bottom-0 h-12 w-full sm:h-16 ${className}`}
      viewBox="0 0 1440 80"
      preserveAspectRatio="none"
    >
      <path
        fill="#22D3EE"
        opacity="0.35"
        d="M0 40c120-20 240-20 360 0s240 20 360 0 240-20 360 0 240 20 360 0v40H0Z"
      />
      <path
        fill="currentColor"
        d="M0 56c120-16 240-16 360 0s240 16 360 0 240-16 360 0 240 16 360 0v24H0Z"
      />
    </svg>
  );
}

export function TemplateBanner() {
  return (
    <p className="bg-sun px-4 py-1.5 text-center text-base font-semibold text-deep">
      Template preview: sample content from hhprc.club. 2027 dates are placeholders.
    </p>
  );
}
