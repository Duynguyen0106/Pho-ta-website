import { chromium, devices } from "playwright";
import { mkdir } from "fs/promises";
import path from "path";

const OUT = "/opt/cursor/artifacts/screenshots";
const BASE = "http://localhost:3000";

async function auditPage(page, name) {
  const issues = [];
  const metrics = await page.evaluate(() => {
    const doc = document.documentElement;
    const overflowX = doc.scrollWidth > doc.clientWidth + 1;
    const sticky = [...document.querySelectorAll("[class*='sticky']")].map(
      (el) => ({
        tag: el.tagName,
        top: getComputedStyle(el).top,
        height: el.getBoundingClientRect().height,
      }),
    );
    const smallTargets = [...document.querySelectorAll("button, a")].filter(
      (el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && (r.width < 44 || r.height < 44);
      },
    ).length;
    return {
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
      overflowX,
      sticky,
      smallTargets,
    };
  });

  if (metrics.overflowX) {
    issues.push(
      `Horizontal overflow: scrollWidth ${metrics.scrollWidth} > viewport ${metrics.clientWidth}`,
    );
  }
  if (metrics.smallTargets > 8) {
    issues.push(`${metrics.smallTargets} tap targets smaller than 44px`);
  }

  await page.screenshot({
    path: path.join(OUT, `${name}.png`),
    fullPage: false,
  });

  return { name, issues, metrics };
}

const iPhone = devices["iPhone 13"];

const browser = await chromium.launch();
const context = await browser.newContext({
  ...iPhone,
  baseURL: BASE,
});
const page = await context.newPage();

await mkdir(OUT, { recursive: true });

const results = [];

await page.goto("/");
results.push(await auditPage(page, "mobile_home"));

await page.click('button[aria-label="Open menu"]');
await page.waitForTimeout(300);
await page.screenshot({ path: path.join(OUT, "mobile_nav_open.png") });
await page.click('button[aria-label="Close menu"]');

await page.goto("/menu");
await page.waitForTimeout(500);
results.push(await auditPage(page, "mobile_menu_top"));

const rail = page.locator('[role="tablist"][aria-label="Menu categories"]');
if (await rail.count()) {
  const before = await rail.evaluate((el) => el.scrollLeft);
  await rail.evaluate((el) => {
    el.scrollLeft += 120;
  });
  const after = await rail.evaluate((el) => el.scrollLeft);
  if (after <= before) {
    results.push({
      name: "menu_category_rail",
      issues: ["Category rail did not scroll horizontally"],
      metrics: {},
    });
  } else {
    await page.screenshot({ path: path.join(OUT, "mobile_menu_rail_scrolled.png") });
  }
}

await page.fill('input[aria-label="Search menu"]', "pho");
await page.waitForTimeout(300);
await page.screenshot({ path: path.join(OUT, "mobile_menu_search.png") });

await page.goto("/menu");
await page.waitForTimeout(300);
const helper = page.locator('button[aria-label="Open menu assistant"]');
if (await helper.isVisible()) {
  await helper.click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, "mobile_menu_helper_open.png") });
  const helperBox = await page.locator('[role="dialog"]').boundingBox();
  if (helperBox && helperBox.width < 300) {
    results.push({
      name: "menu_helper",
      issues: [`Helper dialog narrow: ${Math.round(helperBox.width)}px wide`],
      metrics: {},
    });
  }
}

await page.goto("/book");
results.push(await auditPage(page, "mobile_book"));

await page.goto("/locations");
results.push(await auditPage(page, "mobile_visit"));

await browser.close();

console.log(JSON.stringify(results, null, 2));
