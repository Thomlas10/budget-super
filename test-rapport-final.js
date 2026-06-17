const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('=== RAPPORT TEST - Final ===\n');
    
    // Load fresh
    await page.goto('http://localhost:8001/index.html?t=' + Date.now(), { waitUntil: 'networkidle' });
    
    // Clear data and set dark mode
    await page.evaluate(() => {
      localStorage.removeItem('expenses');
      localStorage.removeItem('incomes');
      localStorage.setItem('app_theme', 'dark');
    });
    
    await page.reload();
    await page.waitForTimeout(1500);

    // Add an expense first
    console.log('Adding expense...');
    await page.click('[data-page="dashboard"]');
    await page.waitForTimeout(500);
    
    await page.fill('#amount', '75.50');
    await page.selectOption('#category', 'Alimentation');
    await page.click('#expenseForm button[type="submit"]');
    await page.waitForTimeout(500);

    // Go to Rapport
    console.log('Checking Rapport...');
    await page.click('[data-page="rapport"]');
    await page.waitForTimeout(500);
    
    // Check category label color
    const categoryLabel = await page.evaluate(() => {
      const elem = document.querySelector('.category-label span');
      if (!elem) return null;
      return {
        text: elem.textContent.trim(),
        color: window.getComputedStyle(elem).color
      };
    });
    
    if (!categoryLabel) {
      console.log('❌ Category label not found');
    } else {
      console.log(`Category: "${categoryLabel.text}"`);
      console.log(`Color: ${categoryLabel.color}`);
      console.log(categoryLabel.color === 'rgb(255, 255, 255)' ? '✅ PASS' : '❌ FAIL');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
