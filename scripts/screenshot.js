const puppeteer = require("puppeteer");
const path = require("path");

const URL = "https://ramenhire.com";
const OUT_DIR = path.join(__dirname, "..", "public");

async function waitForLoad(page) {
  await page.waitForFunction(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 1200));
}

async function run() {
  const browser = await puppeteer.launch({ headless: true });

  // --- OG image: exactly 1200x630 (standard social sharing size) ---
  const ogPage = await browser.newPage();
  await ogPage.setViewport({ width: 1200, height: 630 });
  await ogPage.goto(URL, { waitUntil: "networkidle0", timeout: 30000 });
  await waitForLoad(ogPage);
  await ogPage.screenshot({
    path: path.join(OUT_DIR, "og-screenshot.png"),
    clip: { x: 0, y: 0, width: 1200, height: 630 },
  });
  console.log("✓ og-screenshot.png  (1200×630)");
  await ogPage.close();

  // --- Full-page screenshot at 1440px desktop width ---
  const fullPage = await browser.newPage();
  await fullPage.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await fullPage.goto(URL, { waitUntil: "networkidle0", timeout: 30000 });
  await waitForLoad(fullPage);
  await fullPage.screenshot({
    path: path.join(OUT_DIR, "full-screenshot.png"),
    fullPage: true,
  });
  console.log("✓ full-screenshot.png  (1440px wide, full page, @2x)");
  await fullPage.close();

  await browser.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
