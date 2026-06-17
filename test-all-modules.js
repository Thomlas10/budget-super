const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const results = [];

  try {
    console.log('=== COMPREHENSIVE TEST - All Modules ===\n');
    
    // Load fresh
    await page.goto('http://localhost:8001/index.html?t=' + Date.now(), { waitUntil: 'networkidle' });
    
    // Clear all data
    await page.evaluate(() => {
      localStorage.removeItem('saving_goals');
      localStorage.removeItem('incomes');
      localStorage.removeItem('monthly_subscriptions');
      localStorage.removeItem('expenses');
      localStorage.setItem('app_theme', 'dark');
    });
    
    await page.reload();
    await page.waitForTimeout(1500);

    // Test 1: Goals
    console.log('1️⃣  GOALS');
    await page.click('[data-page="goals"]');
    await page.waitForTimeout(500);
    
    await page.fill('#goalName', '  vacation fund  ');
    await page.fill('#goalTarget', '5000');
    await page.fill('#goalCurrent', '1000');
    await page.click('#goalsForm button[type="submit"]');
    await page.waitForTimeout(500);
    
    const goalName = await page.evaluate(() => document.querySelector('.goal-header')?.textContent.trim());
    const goalColor = await page.evaluate(() => window.getComputedStyle(document.querySelector('.goal-header')).color);
    
    results.push({
      module: 'Goals',
      capitalization: goalName === 'Vacation fund' ? '✅' : '❌',
      darkMode: goalColor === 'rgb(255, 255, 255)' ? '✅' : '❌'
    });
    console.log(`  Capitalization: ${goalName} ${goalName === 'Vacation fund' ? '✅' : '❌'}`);
    console.log(`  Dark mode color: ${goalColor === 'rgb(255, 255, 255)' ? '✅' : '❌'}`);

    // Test 2: Income
    console.log('\n2️⃣  INCOME');
    await page.click('[data-page="income"]');
    await page.waitForTimeout(500);
    
    await page.fill('#incomeSource', '  freelance work  ');
    await page.fill('#incomeAmount', '2000');
    await page.click('#incomeForm button[type="submit"]');
    await page.waitForTimeout(500);
    
    const incomeName = await page.evaluate(() => document.querySelector('.expense-category')?.textContent.trim());
    const incomeColor = await page.evaluate(() => window.getComputedStyle(document.querySelector('.expense-category')).color);
    
    results.push({
      module: 'Income',
      capitalization: incomeName === 'Freelance work' ? '✅' : '❌',
      darkMode: incomeColor === 'rgb(255, 255, 255)' ? '✅' : '❌'
    });
    console.log(`  Capitalization: ${incomeName} ${incomeName === 'Freelance work' ? '✅' : '❌'}`);
    console.log(`  Dark mode color: ${incomeColor === 'rgb(255, 255, 255)' ? '✅' : '❌'}`);

    // Test 3: Subscriptions
    console.log('\n3️⃣  SUBSCRIPTIONS');
    await page.click('[data-page="subscriptions"]');
    await page.waitForTimeout(500);
    
    await page.fill('#subscriptionName', '  hulu premium  ');
    await page.fill('#subscriptionCost', '15.99');
    await page.fill('#subscriptionRenewalDay', '10');
    await page.click('#subscriptionsForm button[type="submit"]');
    await page.waitForTimeout(500);
    
    const subName = await page.evaluate(() => document.querySelector('.subscription-name')?.textContent.trim());
    const subColor = await page.evaluate(() => window.getComputedStyle(document.querySelector('.subscription-name')).color);
    
    results.push({
      module: 'Subscriptions',
      capitalization: subName === 'Hulu premium' ? '✅' : '❌',
      darkMode: subColor === 'rgb(255, 255, 255)' ? '✅' : '❌'
    });
    console.log(`  Capitalization: ${subName} ${subName === 'Hulu premium' ? '✅' : '❌'}`);
    console.log(`  Dark mode color: ${subColor === 'rgb(255, 255, 255)' ? '✅' : '❌'}`);

    // Test 4: Rapport
    console.log('\n4️⃣  RAPPORT');
    await page.click('[data-page="rapport"]');
    await page.waitForTimeout(500);
    
    const categoryColor = await page.evaluate(() => {
      const elem = document.querySelector('.category-label span');
      return elem ? window.getComputedStyle(elem).color : 'not found';
    });
    
    results.push({
      module: 'Rapport',
      darkMode: categoryColor === 'rgb(255, 255, 255)' ? '✅' : '❌'
    });
    console.log(`  Dark mode color: ${categoryColor === 'rgb(255, 255, 255)' ? '✅' : '❌'}`);

    // Summary
    console.log('\n=== SUMMARY ===');
    console.log(JSON.stringify(results, null, 2));
    
    const allPass = results.every(r => 
      (r.capitalization ? r.capitalization === '✅' : true) && 
      (r.darkMode ? r.darkMode === '✅' : true)
    );
    
    console.log('\n' + (allPass ? '🎉 ALL TESTS PASSED!' : '⚠️ SOME TESTS FAILED'));
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
