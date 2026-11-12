import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 1024 } });

await page.goto('http://localhost:3000/creator/profile', { waitUntil: 'networkidle', timeout: 30000 });

const title = await page.title();
console.log('Title:', title);

const checks = await page.evaluate(() => {
  const results = {};
  results.hasHeader = !!document.querySelector('h1');
  results.hasSidebar = !!document.querySelector('aside');
  results.hasMyProfileActive = !!document.querySelector('a[href="/creator/profile"]');
  results.hasVisualIdentity = !!Array.from(document.querySelectorAll('h3')).some(h => h.textContent.includes('Visual Identity'));
  results.hasRateCard = !!Array.from(document.querySelectorAll('h3')).some(h => h.textContent.includes('Rate Card'));
  results.hasBarterToggle = !!document.querySelector('button[aria-label="Accept barter toggle"]');
  results.hasSaveChanges = !!Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('Save Changes'));
  results.hasCancelDiscard = !!Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('Cancel / Discard'));
  results.hasNichePrimary = !!Array.from(document.querySelectorAll('span')).some(s => s.textContent.includes('PRIMARY'));
  results.hasCompletion96 = !!Array.from(document.querySelectorAll('*')).some(n => n.textContent === '96% Completed');
  results.hasMinFloor = !!Array.from(document.querySelectorAll('input')).some(i => i.value === '8,000');
  results.hasReelRate = !!Array.from(document.querySelectorAll('input')).some(i => i.value === '14,000');
  results.hasBioText = !!Array.from(document.querySelectorAll('textarea')).length > 0;
  results.sidebarBg = document.querySelector('aside') ? window.getComputedStyle(document.querySelector('aside')).backgroundColor : null;
  return results;
});

console.log('Design checks:', JSON.stringify(checks, null, 2));

await page.screenshot({ path: '/tmp/opencode/creator_profile.png', fullPage: true });
console.log('Screenshot saved');

await browser.close();
