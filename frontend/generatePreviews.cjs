const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

// read registry file
const registryPath = path.join(__dirname, "src/templates/registry.js");
const registry = fs.readFileSync(registryPath, "utf8");

// extract template IDs
const ids = [...registry.matchAll(/"([0-9a-f]{24})":/g)].map(m => m[1]);

console.log("Found templates:", ids.length);

// simple delay helper
const delay = (ms) => new Promise(res => setTimeout(res, ms));

(async () => {

  const browser = await puppeteer.launch({
    headless: true
  });

  const page = await browser.newPage();

  for (const id of ids) {

    const url = `http://localhost:5173/stu/builder/${id}`;

    console.log("Generating preview:", id);

    // open homepage first
    await page.goto("http://localhost:5173");

    // inject fake login
    await page.evaluate(() => {
      localStorage.setItem("token", "preview-token");
      localStorage.setItem(
        "user",
        JSON.stringify({
          role: "student",
          fullName: "Preview User"
        })
      );
    });

    // open builder page
    await page.goto(url, { waitUntil: "networkidle2" });

    await delay(3000);

    // take screenshot
    await page.screenshot({
      path: `public/template-previews/${id}.png`,
      clip: {
        x: 0,
        y: 0,
        width: 794,
        height: 1123
      }
    });

  }

  await browser.close();

  console.log("All previews generated!");

})();