import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const pages = [
  { path: "/", heading: "Where your family's summer memories are made." },
  { path: "/hours", heading: "Pool hours" },
  { path: "/events", heading: "Events and lessons" },
  { path: "/dues", heading: "Club dues" },
  { path: "/rules", heading: "Club rules" },
  { path: "/login", heading: "Member login" },
  { path: "/about", heading: "About the club" },
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
  await page.getByText("Menu", { exact: true }).click();
  await page.getByRole("link", { name: "Dues" }).first().click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Club dues");
  // The menu closes itself after navigating, so it doesn't cover the new page.
  await expect(page.locator("header details")).not.toHaveAttribute("open");
});

test("home page counts down to opening weekend", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Countdown to opening weekend")).toBeVisible();
  await expect(page.getByText(/\d+ days until opening weekend/)).toBeAttached();
});

test("email sign-up explains mistakes, then confirms", async ({ page }) => {
  await page.goto("/");
  const email = page.getByLabel("Your email");
  await email.fill("not an email");
  await page.getByRole("button", { name: "Sign me up" }).click();
  await expect(page.getByRole("alert")).toContainText("Please enter an email address");

  await email.fill(`e2e-${Date.now()}@example.com`);
  await page.getByRole("button", { name: "Sign me up" }).click();
  await expect(page.getByRole("status")).toContainText("You're on the list!");
});

test("members meeting can be added to a calendar", async ({ page }) => {
  await page.goto("/");
  const download = page.waitForEvent("download");
  await page.getByRole("link", { name: "Add to my calendar" }).click();
  expect((await download).suggestedFilename()).toBe("hhprc-members-meeting.ics");
});

test("healthz reports the database is reachable", async ({ request }) => {
  const res = await request.get("/healthz");
  expect(res.ok()).toBe(true);
  expect(await res.json()).toMatchObject({ ok: true, db: "ok" });
});
