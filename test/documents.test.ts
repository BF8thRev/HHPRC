import { env } from "cloudflare:test";
import { beforeEach, describe, expect, it } from "vitest";

import {
  deleteDocument,
  formatSize,
  listDocuments,
  MAX_BYTES,
  safeFilename,
  uploadDocument,
} from "../app/lib/documents";

function form(title: string, file?: File) {
  const data = new FormData();
  data.set("title", title);
  if (file) data.set("file", file);
  return data;
}

const pdf = (name = "Club Rules 2027.pdf", size = 1234) =>
  new File([new Uint8Array(size)], name, { type: "application/pdf" });

describe("board documents", () => {
  beforeEach(async () => {
    await env.DB.exec("delete from documents");
  });

  it("stores the file in R2 and lists it", async () => {
    const result = await uploadDocument(env, form(" Club rules ", pdf()), "board@example.com");
    expect(result).toEqual({ ok: true, title: "Club rules" });

    const [row] = await listDocuments(env.DB);
    expect(row).toMatchObject({
      title: "Club rules",
      filename: "Club-Rules-2027.pdf",
      contentType: "application/pdf",
      size: 1234,
      uploadedBy: "board@example.com",
    });
    const stored = await env.DOCS.get(row!.key);
    expect(stored?.size).toBe(1234);
    await stored?.arrayBuffer();
  });

  it("refuses files that are the wrong type, too big or missing", async () => {
    const html = new File(["<script>"], "page.html", { type: "text/html" });
    const cases = [
      form("Page", html),
      form("Huge", pdf("huge.pdf", MAX_BYTES + 1)),
      form("Nothing"),
      form("   ", pdf()),
    ];
    for (const data of cases) {
      const result = await uploadDocument(env, data, "board@example.com");
      expect(result.ok).toBe(false);
    }
    expect(await listDocuments(env.DB)).toEqual([]);
  });

  it("removes both the row and the stored file", async () => {
    await uploadDocument(env, form("Menu", pdf("menu.pdf")), "board@example.com");
    const [row] = await listDocuments(env.DB);
    expect(await deleteDocument(env, row!.id)).toBe(true);
    expect(await listDocuments(env.DB)).toEqual([]);
    expect(await env.DOCS.get(row!.key)).toBeNull();
    expect(await deleteDocument(env, row!.id)).toBe(false);
  });
});

describe("safeFilename and formatSize", () => {
  it("makes names safe for a URL", () => {
    expect(safeFilename("../../etc/passwd")).toBe("etc-passwd");
    expect(safeFilename("Maria's menu (2027).docx")).toBe("Maria-s-menu-2027-.docx");
    expect(safeFilename("???")).toBe("document");
  });

  it("reads sizes like a person would", () => {
    expect(formatSize(340 * 1024)).toBe("340 KB");
    expect(formatSize(2.4 * 1024 * 1024)).toBe("2.4 MB");
  });
});
