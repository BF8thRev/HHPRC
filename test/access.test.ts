import { beforeAll, describe, expect, it } from "vitest";

import { requireBoard, verifyAccessToken, type KeyFetcher } from "../app/lib/access";

const config = { teamDomain: "hhprc.cloudflareaccess.com", aud: "board-app-aud" };
const now = Date.UTC(2027, 1, 1);

let signingKey: CryptoKey;
let getKeys: KeyFetcher;
let otherKey: CryptoKey; // a key Access never published

const b64url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
const encode = (value: unknown) => b64url(new TextEncoder().encode(JSON.stringify(value)));

async function sign(payload: Record<string, unknown>, key = signingKey, kid = "k1") {
  const head = encode({ alg: "RS256", kid });
  const body = encode(payload);
  const sig = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(`${head}.${body}`),
  );
  return `${head}.${body}.${b64url(new Uint8Array(sig))}`;
}

const good = () => ({
  aud: [config.aud],
  iss: `https://${config.teamDomain}`,
  exp: now / 1000 + 600,
  email: "Shirley@Example.com",
});

async function rsaPair() {
  return (await crypto.subtle.generateKey(
    {
      name: "RSASSA-PKCS1-v1_5",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["sign", "verify"],
  )) as CryptoKeyPair;
}

beforeAll(async () => {
  const pair = await rsaPair();
  signingKey = pair.privateKey;
  otherKey = (await rsaPair()).privateKey;
  const jwk = (await crypto.subtle.exportKey("jwk", pair.publicKey)) as JsonWebKey;
  getKeys = async () => [{ ...jwk, kid: "k1" }];
});

describe("verifyAccessToken", () => {
  it("accepts a genuine, current token and returns the lowercased email", async () => {
    expect(await verifyAccessToken(await sign(good()), config, getKeys, now)).toBe(
      "shirley@example.com",
    );
  });

  it("rejects a token signed by someone else", async () => {
    const forged = await sign(good(), otherKey);
    expect(await verifyAccessToken(forged, config, getKeys, now)).toBeNull();
  });

  it("rejects a token whose payload was edited after signing", async () => {
    const [head, , sig] = (await sign(good())).split(".");
    const edited = `${head}.${encode({ ...good(), email: "intruder@example.com" })}.${sig}`;
    expect(await verifyAccessToken(edited, config, getKeys, now)).toBeNull();
  });

  it("rejects expired tokens, other apps' tokens and the wrong issuer", async () => {
    const cases = [
      { ...good(), exp: now / 1000 - 1 },
      { ...good(), aud: ["some-other-app"] },
      { ...good(), iss: "https://evil.cloudflareaccess.com" },
      { ...good(), email: undefined },
    ];
    for (const payload of cases) {
      expect(await verifyAccessToken(await sign(payload), config, getKeys, now)).toBeNull();
    }
  });

  it("rejects garbage and unknown key ids", async () => {
    expect(await verifyAccessToken("not.a.token", config, getKeys, now)).toBeNull();
    expect(await verifyAccessToken("abc", config, getKeys, now)).toBeNull();
    expect(
      await verifyAccessToken(await sign(good(), signingKey, "k2"), config, getKeys, now),
    ).toBeNull();
  });
});

describe("requireBoard", () => {
  const prod = {
    APP_ENV: "production",
    ACCESS_TEAM_DOMAIN: config.teamDomain,
    ACCESS_AUD: config.aud,
    DEV_BOARD_EMAIL: "",
  };

  async function status(promise: Promise<unknown>) {
    try {
      await promise;
      return 200;
    } catch (e) {
      return (e as Response).status;
    }
  }

  it("turns away requests with no Access token", async () => {
    expect(await status(requireBoard(new Request("https://x/board"), prod, getKeys))).toBe(403);
  });

  it("ignores the development shortcut in production", async () => {
    const env = { ...prod, DEV_BOARD_EMAIL: "board@example.com" };
    expect(await status(requireBoard(new Request("https://x/board"), env, getKeys))).toBe(403);
  });

  it("stays switched off until Access is configured", async () => {
    const env = { ...prod, ACCESS_TEAM_DOMAIN: "", ACCESS_AUD: "" };
    expect(await status(requireBoard(new Request("https://x/board"), env, getKeys))).toBe(503);
  });

  it("lets a signed-in board member through", async () => {
    const request = new Request("https://x/board", {
      headers: {
        "Cf-Access-Jwt-Assertion": await sign({ ...good(), exp: Date.now() / 1000 + 600 }),
      },
    });
    expect(await requireBoard(request, prod, getKeys)).toBe("shirley@example.com");
  });
});
