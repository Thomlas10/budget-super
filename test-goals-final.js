const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const screenshotDir = './screenshots';
  
  const fs = require('fs');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
  }

  try {
    console.log('Starting final verification tests...\n');
    
    // Navigate with cache busting
    await page.goto('http://localhost:8001/index.html?t=' + Date.now(), { waitUntil: 'networkidle' });
    console.log('✅ App loaded');

    // Switch to Goals and clear any existing data for clean test
    await page.evaluate(() => localStorage.removeItem('saving_goals'));
    await page.reload();
    await page.waitForTimeout(500);
    await page.click('[data-page="goals"]');
    await page.waitForTimeout(500);

    // Test 1: Goal name capitalization
    console.log('\n=== TEST 1: Goal Name Capitalization ===');
    
    await page.fill('#goalName', '  my vacation  ');
    await page.fill('#goalTarget', '5000');
    await page.fill('#goalCurrent', '1000');
    await page.click('#goalsForm button[type="submit"]');
    await page.waitForTimeout(500);
    
    const goalName = await page.evaluate(() => {
      return document.querySelector('.goal-header')?.textContent.trim();
    });
    
    console.log('Entered: "  my vacation  "');
    console.log('Stored as:', goalName);
    
    if (goalName === 'My vacation') {
      console.log('✅ PASS: Goal name correctly capitalized');
    } else {
      console.log('❌ FAIL: Expected "My vacation", got "' + goalName + '"');
    }

    // Test 2: Dark mode CSS
    console.log('\n=== TEST 2: Dark Mode CSS ===');
    
    // Switch to dark theme
    await page.evaluate(() => {
      localStorage.setItem('app_theme', 'dark');
      location.reload();
    });
    
    await page.waitForTimeout(2000);
    await page.click('[data-page="goals"]');
    await page.waitForTimeout(500);
    
    const darkModeColor = await page.evaluate(() => {
      const elem = document.querySelector('.goal-header');
      const computed = window.getComputedStyle(elem);
      const isDarkTheme = document.body.classList.contains('dark-theme');
      return {
        color: computed.color,
        isDarkTheme: isDarkTheme
      };
    });
    
    console.log('Dark theme applied?', darkModeColor.isDarkTheme);
    console.log('Goal header color:', darkModeColor.color);
    
    // Parse RGB
    const rgbMatch = darkModeColor.color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      const [, r, g, b] = rgbMatch;
      console.log(`RGB values: R=${r}, G=${g}, B=${b}`);
      
      if (r > 200 && g > 200 && b > 200) {
        console.log('✅ PASS: Goal header is light (white) in dark mode');
      } else if (r < 100 && g < 100 && b < 100) {
        console.log('❌ FAIL: Goal header is dark (not visible)');
      }
    }
    
    // Take final screenshot
    await page.screenshot({ path: `${screenshotDir}/final-test.png`, fullPage: true });
    console.log('\n✅ Screenshot saved: screenshots/final-test.png');
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
