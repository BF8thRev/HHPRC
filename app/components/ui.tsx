import type { ReactNode } from "react";
import { Link } from "react-router";

import { ArrowIcon } from "./icons";

export function PageHeader({ title, intro }: { title: string; intro?: ReactNode }) {
  return (
    <div className="bg-deep pb-10 text-white">
      <div className="mx-auto max-w-5xl px-4 pt-8">
        <h1 className="font-display text-4xl font-extrabold">{title}</h1>
        {intro && <p className="mt-3 max-w-2xl text-lg text-sky-100">{intro}</p>}
      </div>
    </div>
  );
}

export function Section({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: { label: string; to: string };
}) {
  return (
    <section className="mx-auto max-w-5xl px-4 pt-12">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="font-display text-2xl font-extrabold">{title}</h2>
        {action && <TextLink to={action.to}>{action.label}</TextLink>}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white p-5 shadow-sm ring-1 ring-deep/10 ${className}`}>
      {children}
    </div>
  );
}

/** The one primary action on a screen. */
export function PrimaryButton({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2 rounded-full bg-sun px-6 font-bold text-deep shadow-sm hover:bg-yellow-300 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      {children}
      <ArrowIcon />
    </Link>
  );
}

export function TextLink({ to, children }: { to: string; children: ReactNode }) {
  const className =
    "inline-flex items-center gap-1 font-semibold text-pool-text underline decoration-2 underline-offset-4 hover:text-deep";
  return to.startsWith("mailto:") || to.startsWith("http") ? (
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

export function TemplateBanner() {
  return (
    <p className="bg-sun px-4 py-2 text-center text-base font-semibold text-deep">
      Template preview: sample content from hhprc.club. 2027 dates are placeholders.
    </p>
  );
}
