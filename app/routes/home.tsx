import type { Route } from "./+types/home";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Huntington Hills Swim & Racquet Club" },
    {
      name: "description",
      content: "Pool hours, events and news for Huntington Hills neighbors.",
    },
  ];
}

// Placeholder until the content blocks land in a later phase.
export default function Home() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <p className="font-display text-lg font-bold text-pool-text">Huntington Hills</p>
      <h1 className="mt-2 font-display text-4xl font-extrabold">Swim & Racquet Club</h1>
      <p className="mt-6">
        Our new website is on the way. Soon you'll find pool hours, events and club news here.
      </p>
    </main>
  );
}
