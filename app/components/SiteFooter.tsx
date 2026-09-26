import { Link } from "react-router";

import { club } from "../content/sample";
import { navLinks } from "./SiteHeader";
import { WaveIcon } from "./icons";

export function SiteFooter() {
  const { address } = club;
  return (
    <footer className="mt-16 bg-deep text-white">
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="flex items-center gap-2 font-display text-lg font-extrabold">
            <WaveIcon className="size-6 text-sun" />
            {club.name}
          </p>
          <p className="mt-2 text-sky-100">
            A private club for the {club.homes} homes of {club.neighborhood}, run by volunteer
            neighbors.
          </p>
        </div>

        <div>
          <h2 className="font-display font-bold text-sun">Find us</h2>
          <address className="mt-2 not-italic">
            {address.street}
            <br />
            {address.city}, {address.state} {address.zip}
          </address>
        </div>

        <div>
          <h2 className="font-display font-bold text-sun">Get in touch</h2>
          <ul className="mt-2 space-y-1">
            <li>
              <a className="underline underline-offset-4" href={`mailto:${club.email}`}>
                {club.email}
              </a>
            </li>
            <li>
              <a className="underline underline-offset-4" href={club.facebookGroup}>
                Neighbors' Facebook group
              </a>
            </li>
          </ul>
        </div>
      </div>

      <nav aria-label="Footer" className="border-t border-white/15">
        <ul className="mx-auto flex max-w-5xl flex-wrap gap-x-2 px-4 py-3">
          {navLinks.map((link) => (
            <li key={link.to}>
              <Link to={link.to} className="flex items-center px-2 text-sky-100 hover:text-white">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </footer>
  );
}
