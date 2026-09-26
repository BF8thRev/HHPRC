import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { TemplateBanner } from "./components/ui";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Nunito:wght@700;800&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:flex focus:items-center focus:rounded-full focus:bg-white focus:px-4 focus:font-semibold focus:text-deep"
        >
          Skip to main content
        </a>
        <TemplateBanner />
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let heading = "Something went wrong";
  let details = "Please try again in a moment.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    heading = error.status === 404 ? "We couldn't find that page" : `Error ${error.status}`;
    details =
      error.status === 404
        ? "Check the address, or head back to the home page."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-display text-3xl font-extrabold">{heading}</h1>
      <p className="mt-4">{details}</p>
      {stack && (
        <pre className="mt-6 overflow-x-auto rounded-lg bg-white p-4 text-sm">
          <code>{stack}</code>
        </pre>
      )}
    </div>
  );
}
