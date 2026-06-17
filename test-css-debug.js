const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Load with cache busting
    await page.goto('http://localhost:8000/index.html?nocache=' + Date.now(), { waitUntil: 'networkidle' });
    await page.click('[data-page="goals"]');
    
    // Add a goal
    await page.fill('#goalName', 'Test Goal');
    await page.fill('#goalTarget', '1000');
    await page.fill('#goalCurrent', '500');
    await page.click('#goalsForm button[type="submit"]');
    await page.waitForTimeout(500);
    
    // Check computed style in light mode
    const lightModeColor = await page.evaluate(() => {
      const elem = document.querySelector('.goal-header');
      return window.getComputedStyle(elem).color;
    });
    console.log('Light mode goal-header color:', lightModeColor);
    
    // Switch to dark mode
    await page.evaluate(() => {
      localStorage.setItem('app_theme', 'dark');
    });
    
    // Reload
    await page.reload({ waitUntil: 'networkidle' });
    await page.click('[data-page="goals"]');
    await page.waitForTimeout(500);
    
    // Check dark mode color
    const darkModeColor = await page.evaluate(() => {
      const elem = document.querySelector('.goal-header');
      const computed = window.getComputedStyle(elem);
      const isDarkTheme = document.body.classList.contains('dark-theme');
      return {
        color: computed.color,
        isDarkTheme: isDarkTheme,
        elementText: elem ? elem.textContent : 'not found'
      };
    });
    
    console.log('Dark mode info:', darkModeColor);
    console.log('Is dark-theme applied?', darkModeColor.isDarkTheme);
    console.log('Dark mode goal-header color:', darkModeColor.color);
    
    // Check if CSS rule exists in stylesheets
    const hasRule = await page.evaluate(() => {
      let found = false;
      for (let sheet of document.styleSheets) {
        try {
          for (let rule of sheet.cssRules) {
            if (rule.selectorText === 'body.dark-theme .goal-header') {
              found = true;
              console.log('Found rule:', rule.cssText);
              break;
            }
          }
        } catch (e) {}
      }
      return found;
    });
    
    console.log('CSS rule found?', hasRule);
    
  } finally {
    await browser.close();
  }
})();
