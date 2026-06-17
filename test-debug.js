const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:8000/index.html?t=' + Date.now(), { waitUntil: 'networkidle' });
    await page.click('[data-page="goals"]');
    await page.waitForTimeout(500);
    
    // Check body classes before dark mode
    let bodyClass = await page.evaluate(() => document.body.className);
    console.log('Body class before dark mode:', bodyClass);
    
    // Switch to dark theme
    await page.evaluate(() => {
      localStorage.setItem('app_theme', 'dark');
      location.reload();
    });
    
    await page.waitForTimeout(2000);
    
    // Check body classes after dark mode
    bodyClass = await page.evaluate(() => document.body.className);
    console.log('Body class after dark mode:', bodyClass);
    
    // Check if dark-theme class is present
    const isDarkTheme = await page.evaluate(() => document.body.classList.contains('dark-theme'));
    console.log('Is dark-theme class present:', isDarkTheme);
    
    // Check the CSS rule
    const styleSheets = await page.evaluate(() => {
      const rules = [];
      for (let sheet of document.styleSheets) {
        try {
          for (let rule of sheet.cssRules) {
            if (rule.selectorText && rule.selectorText.includes('dark-theme') && rule.selectorText.includes('goal-header')) {
              rules.push({
                selector: rule.selectorText,
                cssText: rule.cssText
              });
            }
          }
        } catch (e) {}
      }
      return rules;
    });
    
    console.log('CSS rules found:', styleSheets);
    
  } finally {
    await browser.close();
  }
})();
