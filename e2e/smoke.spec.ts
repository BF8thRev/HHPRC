import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const pages = [
  { path: "/", heading: "Your summer starts at the club." },
  { path: "/hours", heading: "Pool hours" },
  { path: "/events", heading: "Events and lessons" },
  { path: "/dues", heading: "Club dues" },
  { path: "/rules", heading: "Club rules" },
  { path: "/login", heading: "Member login" },
];

for (const { path, heading } of pages) {
  test(`${path} loads, fits the screen and passes an accessibility check`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);

    // No horizontal scroll at phone width.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);

    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("phone menu opens and navigates", async ({ page, isMobile }) => {
  test.skip(!isMobile, "phone only");
  await page.goto("/");
  await page.getByText("Menu").click();
  await page.getByRole("link", { name: "Dues" }).first().click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Club dues");
});

test("healthz reports the database is reachable", async ({ request }) => {
  const res = await request.get("/healthz");
  expect(res.ok()).toBe(true);
  expect(await res.json()).toMatchObject({ ok: true, db: "ok" });
});
