# US#6 Design: Rapport Page Visual Statistics

> **Goal:** Create a real-time analytics dashboard on the Rapport page that displays income vs expenses comparisons and category spending breakdown with animated progress bars.

**Architecture:** RapportApp class reads localStorage data, calculates statistics in real-time, and renders two main sections: (1) Global Overview Card with income/expense ratio bar, (2) Category Ranking section with horizontal progress bars showing percentage of total spending per category. All bars animate on page load.

**Tech Stack:** Vanilla JavaScript (RapportApp class), HTML5, CSS3 (animations, transitions)

---

## Data Structure

### Global Statistics Object
```javascript
{
  totalIncome: number,          // Sum of all incomes
  totalExpenses: number,         // Sum of all expenses
  balance: number,               // totalIncome - totalExpenses
  incomePercentage: number,      // (totalIncome / (totalIncome + totalExpenses)) * 100
  expensePercentage: number      // (totalExpenses / (totalIncome + totalExpenses)) * 100
}
```

### Category Statistics Array
```javascript
[
  {
    category: string,            // e.g., "Alimentation"
    amount: number,              // Total spent in category
    percentage: number,          // (amount / totalExpenses) * 100
    color: string                // Category color (e.g., "#0D8B8B")
  },
  // ... more categories sorted by amount descending
]
```

---

## Components & Features

### 1. Rapport Section (HTML)
**File:** `index.html` #rapport section (lines 115-120)

Replace placeholder with:
- **Global Breakdown Card:**
  - Header: "Aperçu Global"
  - Two-column display: Total Income | Total Expenses | Balance
  - Horizontal ratio bar showing income/expense split
  - Animated bar fill on load

- **Category Ranking Section:**
  - Header: "Dépenses par Catégorie"
  - For each category (sorted by amount desc):
    - Category name + amount
    - Horizontal progress bar (filled based on percentage)
    - Percentage text
  - Empty state if no expenses

### 2. RapportApp Class (JavaScript)
**File:** `app.js`

New class that:
- Loads expenses from localStorage on init
- Loads incomes from localStorage via window.incomeApp
- Calculates global statistics (income, expenses, balance, percentages)
- Calculates category statistics with percentages and colors
- Renders global overview card with animated ratio bar
- Renders category progress bars with staggered animations
- Provides real-time calculations whenever Rapport page is opened

**Methods:**
- `constructor()` - Initialize, calculate stats, render
- `calculateGlobalStats()` - Returns {totalIncome, totalExpenses, balance, incomePercentage, expensePercentage}
- `calculateCategoryStats()` - Returns array of {category, amount, percentage, color} sorted by amount descending
- `getCategoryColor(category)` - Returns color for category (Alimentation: #0D8B8B, Transport: #2C5F7F, Divertissement: #7B4A9F, Autre: #6B7D8B)
- `renderGlobalCard()` - Render overview card with animated ratio bar
- `renderCategoryBars()` - Render category progress bars with staggered animation
- `formatCurrency(amount)` - Format number as currency (e.g., "2,500.00€")
- `render()` - Call both render methods

### 3. Styling (CSS)
**File:** `style.css`

Add styles for:
- `.rapport-global-card` - Global overview card container with gradient background
- `.global-stats-row` - Row displaying income, expenses, balance
- `.stat-item` - Individual stat (Income/Expenses/Balance) with bold typography
- `.ratio-bar-container` - Outer container for ratio bar (gray background)
- `.ratio-bar-income` - Green/teal portion of ratio bar (animated)
- `.ratio-bar-expense` - Red portion of ratio bar (animated)
- `.category-bars-section` - Container for category breakdown
- `.category-bar-item` - Individual category row
- `.category-label` - Category name + amount display
- `.progress-bar-container` - Outer gray progress bar background
- `.progress-bar-fill` - Inner colored progress bar (animated with stagger)
- `.category-percentage` - Percentage text display

**Color Scheme by Category:**
- Alimentation: `#0D8B8B` (teal)
- Transport: `#2C5F7F` (blue)
- Divertissement: `#7B4A9F` (purple)
- Autre: `#6B7D8B` (gray)

**Animations:**
- Global ratio bar: width 0.8s cubic-bezier(0.4, 0, 0.2, 1) on page load
- Category progress bars: width 0.8s cubic-bezier(0.4, 0, 0.2, 1) with staggered delay
  - Alimentation: 0ms delay
  - Transport: 100ms delay
  - Divertissement: 200ms delay
  - Autre: 300ms delay

### 4. Integration
**File:** `app.js`

- Initialize RapportApp in `DOMContentLoaded` event
- Store reference as `window.rapportApp`
- RapportApp renders whenever Rapport page is opened (triggered by Router)

---

## Data Flow

1. User clicks "Rapport" nav button
2. Router shows #rapport section
3. RapportApp reads `expenses` from localStorage
4. RapportApp reads `incomes` from window.incomeApp
5. Calculates total income, total expenses, balance
6. Calculates percentage of total for each category
7. Renders global card with animated ratio bar
8. Renders category bars with staggered animations
9. Data updates in real-time on each page view

---

## Edge Cases & Empty States

- **No expenses:** Category section shows "Aucune dépense enregistrée"
- **No incomes:** Income shows "0.00€"
- **Single category:** Still renders with 100% bar fill
- **Division by zero:** If no income and no expenses, both percentages show 0%

---

## Testing Criteria

1. Global card displays correct income/expense values
2. Ratio bar animates on page load (income/expense sections)
3. Category bars display with correct percentages
4. Categories sorted by amount (highest to lowest)
5. Progress bars animate with staggered timing (100ms between each)
6. Correct colors per category (Alimentation=teal, Transport=blue, etc.)
7. Percentage calculations accurate (sum of all = 100%)
8. Empty states display correctly when no data
9. Hover effects on category items work smoothly
10. Page refresh shows same data (localStorage persistence)

---

## Future Considerations (Out of Scope)

- Date range filtering (this month vs. all time)
- Export report as PDF/CSV
- Custom color themes per user preference
- Monthly/yearly comparison charts
- Income breakdown by source (similar to expense breakdown)
