import { getDocument } from "../lib/documents";
import type { Route } from "./+types/files";

// Public download for a board-uploaded document: /files/<id>/<name>.
export async function loader({ params, context }: Route.LoaderArgs) {
  const { env } = context.cloudflare;
  const row = await getDocument(env.DB, params.id);
  const object = row && (await env.DOCS.get(row.key));
  if (!row || !object) throw new Response("We couldn't find that document.", { status: 404 });

  return new Response(object.body, {
    headers: {
      "Content-Type": row.contentType,
      "Content-Length": String(row.size),
      "Content-Disposition": `inline; filename="${row.filename}"`,
      "Cache-Control": "public, max-age=300",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
