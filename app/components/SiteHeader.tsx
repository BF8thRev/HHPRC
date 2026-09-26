import { NavLink } from "react-router";

import { MenuIcon, SunIcon } from "./icons";

export const navLinks = [
  { to: "/hours", label: "Hours" },
  { to: "/events", label: "Events & lessons" },
  { to: "/dues", label: "Dues" },
  { to: "/rules", label: "Rules" },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center rounded-full px-4 font-semibold transition-colors hover:bg-white/15 ${
    isActive ? "bg-white/15 underline decoration-sun decoration-2 underline-offset-8" : ""
  }`;

export function SiteHeader() {
  return (
    <header className="bg-deep text-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <NavLink to="/" className="flex items-center gap-2" aria-label="Huntington Hills home">
          <span className="grid size-10 place-items-center rounded-full bg-sun text-deep">
            <SunIcon className="size-6" />
          </span>
          <span className="font-display text-xl leading-tight font-extrabold">
            Huntington Hills
            <span className="block text-sm font-bold text-sky-200">Swim & Racquet Club</span>
          </span>
        </NavLink>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
          <NavLink
            to="/login"
            className="ml-2 flex items-center rounded-full border-2 border-white/70 px-4 font-semibold hover:bg-white hover:text-deep"
          >
            Member login
          </NavLink>
        </nav>

        {/* Phone menu: works without JavaScript. */}
        <details className="group relative md:hidden">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-full border-2 border-white/70 px-4 font-semibold [&::-webkit-details-marker]:hidden">
            <MenuIcon className="size-5" />
            Menu
          </summary>
          <nav
            aria-label="Main"
            className="absolute right-0 z-20 mt-2 flex w-60 flex-col rounded-2xl bg-white p-2 text-deep shadow-xl"
          >
            {[...navLinks, { to: "/login", label: "Member login" }].map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center rounded-xl px-4 font-semibold hover:bg-sand ${isActive ? "bg-sand" : ""}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </details>
      </div>
    </header>
  );
}
