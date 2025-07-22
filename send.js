// send.js
require('dotenv').config();
const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const KEYWORDS = [
  'platform', 'dashboard', 'membership', 'saas', 'web app',
  'wordpress', 'Webflow', 'wix', 'shopify', 'shopify theme',
  'shopify development', 'shopify development agency', 'shopify development company',
  'shopify development team', 'shopify development services', 'woocommerce', 'Mandarin',
  'web development', 'web developer', 'seo', 'automation', '3d website', 'chatbot'
];

const HISTORY_FILE = path.join(__dirname, 'sent_projects.json');

let sentLinks = [];
try {
  if (fs.existsSync(HISTORY_FILE)) {
    sentLinks = JSON.parse(fs.readFileSync(HISTORY_FILE));
    console.log(`📁 Loaded history with ${sentLinks.length} sent projects.`);
  } else {
    console.log("📁 No history file found, starting fresh.");
  }
} catch (e) {
  console.warn("⚠️ Failed to load history. Starting fresh.");
}

(async () => {
  const WEBHOOK_URL = process.env.WEBHOOK_URL;
  if (!WEBHOOK_URL) {
    console.error("❌ Missing WEBHOOK_URL in .env");
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: null,
  });
  const page = await browser.newPage();

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
  );

  console.log("🔍 Navigating to Freelancer jobs page...");
  await page.goto('https://www.freelancer.com/jobs/?q=platform', {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });

  console.log("📦 Extracting project data...");
  const projects = await page.evaluate((KEYWORDS) => {
    const cards = Array.from(document.querySelectorAll('.JobSearchCard-item'));
    console.log(`🧾 Found ${cards.length} job cards`);

    return cards.slice(0, 20).map((card, idx) => {
      const titleEl = card.querySelector('.JobSearchCard-primary-heading-link');
      const descEl = card.querySelector('.JobSearchCard-primary-description');
      const budgetEl = card.querySelector('.JobSearchCard-secondary-price');
      const tagsEl = card.querySelectorAll('.JobSearchCard-primary-tagsLink');
      const tags = Array.from(tagsEl).map(tag => tag.innerText.trim());

      const title = titleEl?.innerText.trim() || '';
      const description = descEl?.innerText.trim() || '';
      const combined = `${title} ${description}`.toLowerCase();

      console.log(`🔍 [${idx}] Title: ${title}`);
      console.log(`    → Description: ${description}`);

      const matched = KEYWORDS.some(keyword => combined.includes(keyword));
      console.log(`    → Keyword matched? ${matched}`);

      if (!matched) {
        console.log(`    ❌ Skipped: No keyword matched.`);
        return null;
      }

      const link = titleEl ? `https://www.freelancer.com${titleEl.getAttribute('href')}` : '';
      if (!link) {
        console.log(`    ❌ Skipped: No link found.`);
        return null;
      }

      const budgetText = budgetEl?.innerText.trim() || '';
      console.log(`    → Budget raw: ${budgetText}`);

      const budgetLower = budgetText.toLowerCase();
      if (budgetLower.includes('hour') || budgetLower.includes('/hr') || budgetLower.includes('hourly')) {
        console.log(`    ❌ Skipped: Hourly job.`);
        return null;
      }

      const budgetValues = (budgetText.match(/\d{2,5}/g) || []).map(n => parseInt(n));
      const budgetLow = budgetValues.length > 0 ? Math.min(...budgetValues) : null;
      console.log(`    → Parsed lowest budget: ${budgetLow}`);

      if (budgetLow !== null && budgetLow < 300) {
        console.log(`    ❌ Skipped: Budget too low.`);
        return null;
      }

      console.log(`    ✅ Included: ${title}`);
      return {
        title,
        description,
        budget: budgetText,
        tags,
        posted_time: card.querySelector('.JobSearchCard-primary-heading-days')?.innerText.trim() || '',
        link
      };
    }).filter(Boolean);
  }, KEYWORDS);

  await browser.close();
  console.log(`🔍 Total matching projects after filter: ${projects.length}`);

  const newProjects = projects.filter(p => !sentLinks.includes(p.link));
  console.log(`🆕 New (unsent) projects: ${newProjects.length}`);

  if (!newProjects.length) {
    console.log("🟡 No new matching projects found.");
    return;
  }

  console.log(`🚀 Sending ${newProjects.length} new project(s) to Power Automate...`);
  for (const project of newProjects) {
    try {
      const res = await axios.post(WEBHOOK_URL, project);
      console.log(`✅ Sent: ${project.title} | Status: ${res.status}`);
      sentLinks.push(project.link);
    } catch (err) {
      console.error(`❌ Failed to send: ${project.title}`, err.response?.data || err.message);
    }
  }

  fs.writeFileSync(HISTORY_FILE, JSON.stringify(sentLinks, null, 2));
  console.log("✅ All done. History updated.");
})();
