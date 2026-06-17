const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const screenshotDir = './screenshots';
  
  // Disable caching
  await page.setExtraHTTPHeaders({
    'Cache-Control': 'no-cache, no-store, must-revalidate'
  });
  
  const fs = require('fs');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
  }

  try {
    console.log('Starting tests...\n');
    
    // Navigate to the app with cache disabled
    await page.goto('http://localhost:8000/index.html?t=' + Date.now(), { waitUntil: 'networkidle' });
    console.log('✅ App loaded successfully');

    // Step 1: Test goal name capitalization first (light mode)
    console.log('\n--- Testing Goal Name Capitalization ---');
    
    // Switch to Goals page
    await page.click('[data-page="goals"]');
    await page.waitForTimeout(500);
    
    // Fill in goal form with lowercase and spaces
    await page.fill('#goalName', '  vacation planning  ');
    await page.fill('#goalTarget', '5000');
    await page.fill('#goalCurrent', '1000');
    
    // Check the input value before submit
    const inputValue = await page.inputValue('#goalName');
    console.log('Input value before submit:', inputValue);
    
    // Submit the form
    await page.click('#goalsForm button[type="submit"]');
    await page.waitForTimeout(500);
    console.log('✅ Goal submitted with test data');
    
    // Read the page content to verify capitalization
    const goalText = await page.evaluate(() => {
      const goalHeaders = document.querySelectorAll('.goal-header');
      return Array.from(goalHeaders).map(el => el.textContent.trim());
    });
    
    console.log('Goal names found:', goalText);
    
    if (goalText.some(name => name === 'Vacation planning')) {
      console.log('✅ Goal name correctly capitalized: "Vacation planning"');
    } else if (goalText.some(name => name.includes('vacation'))) {
      console.log('❌ Goal name NOT capitalized:', goalText);
    }
    
    // Take screenshot of capitalized goal
    await page.screenshot({ path: `${screenshotDir}/01-light-mode-goal.png`, fullPage: true });
    console.log('✅ Screenshot taken: light mode with goal');

    // Step 2: Test dark mode
    console.log('\n--- Testing Dark Mode for Goals ---');
    
    // Now switch to dark theme by setting localStorage
    await page.evaluate(() => {
      localStorage.setItem('app_theme', 'dark');
      location.reload();
    });
    
    await page.waitForTimeout(2000);
    await page.click('[data-page="goals"]');
    await page.waitForTimeout(500);
    
    // Take screenshot of dark mode
    await page.screenshot({ path: `${screenshotDir}/02-dark-mode-goals.png`, fullPage: true });
    console.log('✅ Screenshot taken: dark mode goals page');
    
    // Verify dark mode CSS is working
    const goalHeaderColor = await page.evaluate(() => {
      const goalHeader = document.querySelector('.goal-header');
      if (goalHeader) {
        return window.getComputedStyle(goalHeader).color;
      }
      return null;
    });
    
    console.log('\n--- Dark Mode CSS Verification ---');
    console.log('Goal header color:', goalHeaderColor);
    
    // Parse RGB color
    if (goalHeaderColor) {
      const rgbMatch = goalHeaderColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (rgbMatch) {
        const [, r, g, b] = rgbMatch;
        console.log(`RGB values: R=${r}, G=${g}, B=${b}`);
        if (r > 200 && g > 200 && b > 200) {
          console.log('✅ Goal header color is light (white/light gray in dark mode)');
        } else {
          console.log('❌ Goal header color is NOT light enough');
        }
      }
    }

    console.log('\n✅ Tests completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
