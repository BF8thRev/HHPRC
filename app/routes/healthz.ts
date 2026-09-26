import type { Route } from "./+types/healthz";

// Used by CI and after each deploy to confirm the Worker can reach D1.
export async function loader({ context }: Route.LoaderArgs) {
  const { env } = context.cloudflare;
  try {
    await env.DB.prepare("select 1").first();
    return Response.json({ ok: true, env: env.APP_ENV, db: "ok" });
  } catch {
    return Response.json({ ok: false, env: env.APP_ENV, db: "error" }, { status: 503 });
  }
}
