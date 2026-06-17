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
    console.log('Testing final corrections...\n');
    
    // Load app
    await page.goto('http://localhost:8001/index.html?t=' + Date.now(), { waitUntil: 'networkidle' });
    
    // Clear data for clean test
    await page.evaluate(() => {
      localStorage.removeItem('monthly_subscriptions');
      localStorage.removeItem('expenses');
      localStorage.removeItem('incomes');
    });
    await page.reload();
    await page.waitForTimeout(1000);

    // TEST 1: Subscriptions
    console.log('=== TEST 1: Subscriptions ===');
    await page.click('[data-page="subscriptions"]');
    await page.waitForTimeout(500);
    
    await page.fill('#subscriptionName', '  netflix  ');
    await page.fill('#subscriptionCost', '12.99');
    await page.fill('#subscriptionRenewalDay', '15');
    await page.click('#subscriptionsForm button[type="submit"]');
    await page.waitForTimeout(500);
    
    const subName = await page.evaluate(() => {
      return document.querySelector('.subscription-name')?.textContent.trim();
    });
    
    console.log('Entered: "  netflix  "');
    console.log('Stored as:', subName);
    console.log(subName === 'Netflix' ? '✅ PASS' : '❌ FAIL');

    // Switch to dark mode for subscription test
    await page.evaluate(() => {
      localStorage.setItem('app_theme', 'dark');
      location.reload();
    });
    
    await page.waitForTimeout(2000);
    await page.click('[data-page="subscriptions"]');
    await page.waitForTimeout(500);
    
    const subNameDarkColor = await page.evaluate(() => {
      const elem = document.querySelector('.subscription-name');
      return window.getComputedStyle(elem).color;
    });
    
    console.log('Dark mode subscription color:', subNameDarkColor);
    console.log(subNameDarkColor === 'rgb(255, 255, 255)' ? '✅ PASS' : '⚠️ CHECK');

    await page.screenshot({ path: `${screenshotDir}/subscriptions-final.png`, fullPage: true });

    // TEST 2: Rapport Categories
    console.log('\n=== TEST 2: Rapport Categories ===');
    
    // Add some expenses first
    await page.click('[data-page="dashboard"]');
    await page.waitForTimeout(500);
    
    await page.fill('#amount', '50');
    await page.selectOption('#category', 'Alimentation');
    await page.click('#expenseForm button[type="submit"]');
    await page.waitForTimeout(500);
    
    // Switch to Rapport
    await page.click('[data-page="rapport"]');
    await page.waitForTimeout(500);
    
    const categoryLabelColor = await page.evaluate(() => {
      const elem = document.querySelector('.category-label span');
      return window.getComputedStyle(elem).color;
    });
    
    console.log('Dark mode category label color:', categoryLabelColor);
    console.log(categoryLabelColor === 'rgb(255, 255, 255)' ? '✅ PASS' : '⚠️ CHECK');

    await page.screenshot({ path: `${screenshotDir}/rapport-final.png`, fullPage: true });
    
    console.log('\n✅ All tests completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
