// Board sign-in is handled by Cloudflare Access: it sits in front of /board,
// emails board members a one-time code, and then forwards each request with a
// signed token in the Cf-Access-Jwt-Assertion header. We never trust the
// header blindly: every request re-checks the signature, audience, issuer and
// expiry on the server, so a request that skips Access gets nothing.

export type AccessConfig = {
  teamDomain: string; // e.g. "hhprc.cloudflareaccess.com"
  aud: string; // the Access application's AUD tag
};

type Jwk = JsonWebKey & { kid?: string };
export type KeyFetcher = (teamDomain: string) => Promise<Jwk[]>;

const b64urlBytes = (part: string) => {
  const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};
const b64urlJson = (part: string) =>
  JSON.parse(new TextDecoder().decode(b64urlBytes(part))) as Record<string, unknown>;

// Access rotates its signing keys rarely; keep them for an hour per Worker.
let cachedKeys: { domain: string; keys: Jwk[]; at: number } | undefined;

export const fetchAccessKeys: KeyFetcher = async (teamDomain) => {
  if (cachedKeys?.domain === teamDomain && Date.now() - cachedKeys.at < 3_600_000) {
    return cachedKeys.keys;
  }
  const res = await fetch(`https://${teamDomain}/cdn-cgi/access/certs`);
  if (!res.ok) throw new Error(`Access keys unavailable (${res.status})`);
  const { keys } = (await res.json()) as { keys: Jwk[] };
  cachedKeys = { domain: teamDomain, keys, at: Date.now() };
  return keys;
};

/** Returns the signed-in email if the token is genuine and current, otherwise null. */
export async function verifyAccessToken(
  token: string,
  config: AccessConfig,
  getKeys: KeyFetcher = fetchAccessKeys,
  now = Date.now(),
): Promise<string | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [headerPart, payloadPart, signaturePart] = parts as [string, string, string];

  let header: Record<string, unknown>;
  let payload: Record<string, unknown>;
  try {
    header = b64urlJson(headerPart);
    payload = b64urlJson(payloadPart);
  } catch {
    return null;
  }
  if (header.alg !== "RS256") return null;

  const jwk = (await getKeys(config.teamDomain)).find((k) => k.kid === header.kid);
  if (!jwk) return null;
  const key = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const signed = new TextEncoder().encode(`${headerPart}.${payloadPart}`);
  const valid = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    b64urlBytes(signaturePart),
    signed,
  );
  if (!valid) return null;

  const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!audiences.includes(config.aud)) return null;
  if (payload.iss !== `https://${config.teamDomain}`) return null;
  if (typeof payload.exp !== "number" || payload.exp * 1000 <= now) return null;
  if (typeof payload.email !== "string" || !payload.email) return null;
  return payload.email.toLowerCase();
}

type BoardEnv = Pick<Env, "APP_ENV" | "ACCESS_TEAM_DOMAIN" | "ACCESS_AUD" | "DEV_BOARD_EMAIL">;

/**
 * The board member making this request, or a thrown 403/503 response.
 * Call at the top of every /board loader and action.
 */
export async function requireBoard(
  request: Request,
  env: BoardEnv,
  getKeys: KeyFetcher = fetchAccessKeys,
): Promise<string> {
  // Local development has no Access in front of it.
  if (env.APP_ENV === "development" && env.DEV_BOARD_EMAIL) {
    return env.DEV_BOARD_EMAIL.toLowerCase();
  }
  if (!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD) {
    throw new Response("The board portal hasn't been switched on yet.", { status: 503 });
  }
  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  const email = token
    ? await verifyAccessToken(
        token,
        { teamDomain: env.ACCESS_TEAM_DOMAIN, aud: env.ACCESS_AUD },
        getKeys,
      )
    : null;
  if (!email) throw new Response("Board members only.", { status: 403 });
  return email;
}
