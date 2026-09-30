import { useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router";

import { MenuIcon, SunIcon } from "./icons";

export const navLinks = [
  { to: "/hours", label: "Hours" },
  { to: "/events", label: "Events & lessons" },
  { to: "/dues", label: "Dues" },
  { to: "/rules", label: "Rules" },
  { to: "/about", label: "About" },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center rounded-full px-4 font-semibold transition-colors hover:bg-pool/10 ${
    isActive ? "bg-pool/15 text-deep" : "text-deep/80"
  }`;

export function SiteHeader() {
  const menu = useRef<HTMLDetailsElement>(null);
  const { pathname } = useLocation();

  // Close the phone menu after a tap takes you to a new page, and on Escape
  // or a tap outside it.
  useEffect(() => {
    if (menu.current) menu.current.open = false;
  }, [pathname]);
  useEffect(() => {
    const close = (e: Event) => {
      const el = menu.current;
      if (!el?.open) return;
      if (e instanceof KeyboardEvent) {
        if (e.key !== "Escape") return;
        el.open = false;
        el.querySelector("summary")?.focus(); // back to the Menu button
      } else if (!el.contains(e.target as Node)) {
        el.open = false;
      }
    };
    document.addEventListener("keydown", close);
    document.addEventListener("click", close);
    return () => {
      document.removeEventListener("keydown", close);
      document.removeEventListener("click", close);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-deep/10 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2">
        <NavLink to="/" className="flex items-center gap-2.5" aria-label="Huntington Hills home">
          <span className="grid size-11 place-items-center rounded-2xl bg-sun text-deep shadow-sm">
            <SunIcon className="size-7" />
          </span>
          <span className="font-display text-xl leading-none font-extrabold whitespace-nowrap text-deep">
            Huntington Hills
            <span className="mt-0.5 block text-base font-bold whitespace-nowrap text-pool-text">
              Swim & Racquet Club
            </span>
          </span>
        </NavLink>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
          <NavLink
            to="/login"
            className="ml-2 flex items-center rounded-full border-2 border-deep px-5 font-semibold text-deep hover:bg-deep hover:text-white"
          >
            Member login
          </NavLink>
        </nav>

        {/* Phone menu: works without JavaScript. */}
        <details ref={menu} className="group relative lg:hidden">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-full bg-deep px-4 font-semibold text-white [&::-webkit-details-marker]:hidden">
            <MenuIcon className="size-5" />
            Menu
          </summary>
          <nav
            aria-label="Main"
            className="absolute right-0 z-20 mt-2 flex w-64 flex-col rounded-3xl bg-white p-2 text-deep shadow-xl ring-1 ring-deep/10"
          >
            {[{ to: "/", label: "Home" }, ...navLinks, { to: "/login", label: "Member login" }].map(
              (link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end
                  className={({ isActive }) =>
                    `flex items-center rounded-2xl px-4 font-semibold hover:bg-sand ${isActive ? "bg-pool/15" : ""}`
                  }
                >
                  {link.label}
                </NavLink>
              ),
            )}
          </nav>
        </details>
      </div>
    </header>
  );
}
