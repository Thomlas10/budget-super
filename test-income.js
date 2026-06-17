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
    console.log('Starting Income tests...\n');
    
    // Load app with fresh cache
    await page.goto('http://localhost:8001/index.html?t=' + Date.now(), { waitUntil: 'networkidle' });
    
    // Clear existing data for clean test
    await page.evaluate(() => localStorage.removeItem('incomes'));
    await page.reload();
    await page.waitForTimeout(500);
    
    // Navigate to Income page
    await page.click('[data-page="income"]');
    await page.waitForTimeout(500);

    // Test 1: Income source capitalization
    console.log('=== TEST 1: Income Source Capitalization ===');
    
    await page.fill('#incomeSource', '  freelance  ');
    await page.fill('#incomeAmount', '2000');
    await page.click('#incomeForm button[type="submit"]');
    await page.waitForTimeout(500);
    
    const incomeSource = await page.evaluate(() => {
      return document.querySelector('.expense-category')?.textContent.trim();
    });
    
    console.log('Entered: "  freelance  "');
    console.log('Stored as:', incomeSource);
    
    if (incomeSource === 'Freelance') {
      console.log('✅ PASS: Income source correctly capitalized');
    } else {
      console.log('❌ FAIL: Expected "Freelance", got "' + incomeSource + '"');
    }

    // Take light mode screenshot
    await page.screenshot({ path: `${screenshotDir}/income-light-mode.png`, fullPage: true });
    console.log('✅ Screenshot: light mode income');

    // Test 2: Dark mode visibility
    console.log('\n=== TEST 2: Dark Mode Income Source Visibility ===');
    
    // Switch to dark theme
    await page.evaluate(() => {
      localStorage.setItem('app_theme', 'dark');
      location.reload();
    });
    
    await page.waitForTimeout(2000);
    await page.click('[data-page="income"]');
    await page.waitForTimeout(500);
    
    const darkModeColor = await page.evaluate(() => {
      const elem = document.querySelector('.expense-category');
      return window.getComputedStyle(elem).color;
    });
    
    console.log('Dark mode income source color:', darkModeColor);
    
    const rgbMatch = darkModeColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      const [, r, g, b] = rgbMatch;
      console.log(`RGB values: R=${r}, G=${g}, B=${b}`);
      
      if (r > 200 && g > 200 && b > 200) {
        console.log('✅ PASS: Income source is light (white) in dark mode');
      } else {
        console.log('❌ FAIL: Income source color is not white enough');
      }
    }

    // Take dark mode screenshot
    await page.screenshot({ path: `${screenshotDir}/income-dark-mode.png`, fullPage: true });
    console.log('✅ Screenshot: dark mode income');
    
    console.log('\n✅ All income tests completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
