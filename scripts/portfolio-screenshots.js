const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

const URL = "https://ramenhire.com";
const OUT_DIR = path.join(__dirname, "..", "public", "portfolio-screenshots");

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

async function waitForLoad(page) {
  await page.waitForFunction(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 1000));
}

async function dismissModal(page) {
  try {
    const closeBtn = await page.waitForSelector('button[aria-label="Close"]', { timeout: 4000 });
    await closeBtn.click();
    await new Promise((r) => setTimeout(r, 400));
  } catch {
    // modal didn't appear — nothing to dismiss
  }
}

async function dismissCookieBanner(page) {
  try {
    await page.waitForSelector('[aria-label="Cookie consent"]', { timeout: 3000 });
    const declineHandle = await page.evaluateHandle(() => {
      const banner = document.querySelector('[aria-label="Cookie consent"]');
      if (!banner) return null;
      return [...banner.querySelectorAll("button")].find((b) => b.textContent.trim() === "Decline");
    });
    const declineElement = declineHandle.asElement();
    if (declineElement) {
      await declineElement.click();
      await new Promise((r) => setTimeout(r, 400));
    }
  } catch {
    // banner didn't appear — nothing to dismiss
  }
}

async function run() {
  const browser = await puppeteer.launch({ headless: true });

  // --- 1. Job listings section (desktop) ---
  const jobsPage = await browser.newPage();
  await jobsPage.setViewport({ width: 1440, height: 820, deviceScaleFactor: 2 });
  await jobsPage.goto(URL, { waitUntil: "networkidle0", timeout: 30000 });
  await waitForLoad(jobsPage);
  await dismissCookieBanner(jobsPage);
  await dismissModal(jobsPage);
  await jobsPage.evaluate(() => {
    const heading = [...document.querySelectorAll("h2")].find((el) =>
      el.textContent.includes("Latest Openings")
    );
    if (heading) heading.scrollIntoView({ block: "start" });
  });
  await new Promise((r) => setTimeout(r, 500));
  await jobsPage.screenshot({ path: path.join(OUT_DIR, "job-listings-section.png") });
  console.log("✓ job-listings-section.png");
  await jobsPage.close();

  // --- 2. Post-a-job page ---
  const postJobPage = await browser.newPage();
  await postJobPage.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await postJobPage.goto(`${URL}/post-job`, { waitUntil: "networkidle0", timeout: 30000 });
  await waitForLoad(postJobPage);
  await dismissCookieBanner(postJobPage);
  await postJobPage.screenshot({ path: path.join(OUT_DIR, "post-job-page.png") });
  console.log("✓ post-job-page.png");
  await postJobPage.close();

  // --- 3. Company registration form, filled with placeholder data ---
  const registerPage = await browser.newPage();
  await registerPage.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await registerPage.goto(`${URL}/companies/register`, { waitUntil: "networkidle0", timeout: 30000 });
  await waitForLoad(registerPage);
  await dismissCookieBanner(registerPage);
  await registerPage.type('input[type="text"]:not(#company_url_confirm)', "Example Co");
  await registerPage.type('input[type="url"]', "https://example.com");
  await registerPage.type('input[type="email"]', "hello@example.com");
  await registerPage.type(
    "textarea",
    "We build simple, profitable tools for small teams. Fully bootstrapped since day one."
  );
  await registerPage.screenshot({ path: path.join(OUT_DIR, "company-register-form.png") });
  console.log("✓ company-register-form.png");
  await registerPage.close();

  // --- 4. Mobile homepage (iPhone-sized viewport, full page) ---
  const mobilePage = await browser.newPage();
  await mobilePage.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await mobilePage.goto(URL, { waitUntil: "networkidle0", timeout: 30000 });
  await waitForLoad(mobilePage);
  await dismissCookieBanner(mobilePage);
  await dismissModal(mobilePage);
  await new Promise((r) => setTimeout(r, 300));
  await mobilePage.screenshot({ path: path.join(OUT_DIR, "homepage-mobile.png") });
  console.log("✓ homepage-mobile.png");
  await mobilePage.close();

  // --- 5. Stats bar close-up ---
  const statsPage = await browser.newPage();
  await statsPage.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await statsPage.goto(URL, { waitUntil: "networkidle0", timeout: 30000 });
  await waitForLoad(statsPage);
  await dismissCookieBanner(statsPage);
  const statsHandle = await statsPage.evaluateHandle(() => {
    const label = [...document.querySelectorAll("*")].find(
      (el) => el.children.length === 0 && el.textContent.trim() === "Open positions"
    );
    return label ? label.closest("section") : null;
  });
  const statsElement = statsHandle.asElement();
  if (statsElement) {
    await statsElement.screenshot({ path: path.join(OUT_DIR, "stats-badge-closeup.png") });
    console.log("✓ stats-badge-closeup.png");
  } else {
    console.warn("stats bar element not found — skipped");
  }
  await statsPage.close();

  await browser.close();
  console.log(`\nAll screenshots saved to ${OUT_DIR}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
