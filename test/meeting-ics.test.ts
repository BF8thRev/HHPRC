import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";

import { loader } from "../app/routes/meeting-ics";

describe("/meeting.ics", () => {
  it("is a calendar file with an all-day entry until the time is confirmed", async () => {
    const res = await loader({ context: { cloudflare: { env } } } as never);
    expect(res.headers.get("Content-Type")).toContain("text/calendar");
    const body = await res.text();
    expect(body).toContain("BEGIN:VEVENT");
    expect(body).toContain("DTSTART;VALUE=DATE:20270226");
    expect(body).toContain("SUMMARY:Huntington Hills members meeting");
    // Lines end with CRLF, as calendar apps expect.
    expect(body.split("\r\n").length).toBeGreaterThan(5);
  });
});
