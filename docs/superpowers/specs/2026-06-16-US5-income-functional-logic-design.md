# US#5 Design: My Income Page Functional Logic

> **Goal:** Implement a functional income tracking system that mirrors the expense tracking pattern, allowing users to log income sources and see their balance (income - expenses) on the Dashboard.

**Architecture:** Mirror the expense tracking pattern with a dedicated income management system that integrates with the existing Dashboard balance calculation.

**Tech Stack:** Vanilla JavaScript (IncomeApp class), HTML5, localStorage (separate `incomes` key)

---

## Data Structure

### Income Object
```javascript
{
  id: timestamp,           // Unique identifier (Date.now())
  amount: number,          // Income amount in euros
  source: string,          // Source name (e.g., "Salary", "Freelance")
  date: string             // Date in YYYY-MM-DD format
}
```

### localStorage Keys
- `expenses` - existing array of expense objects
- `incomes` - new array of income objects

---

## Components & Features

### 1. My Income Section (HTML)
**File:** `index.html` #income section

Replace placeholder with:
- **Form** with fields:
  - Amount input (number, step 0.01, required)
  - Source input (text, required, e.g., "Salary", "Freelance")
  - Date input (date type, required, defaults to today)
  - Submit button styled to match Dashboard form
- **Income History List** below form showing:
  - Date (formatted as "long date" in French locale)
  - Source name
  - Amount in euros
  - Chronologically ordered (most recent first)
  - Empty state message when no incomes

### 2. IncomeApp Class (JavaScript)
**File:** `app.js`

New class that:
- Loads incomes from localStorage on init
- Manages income form submission (`handleAddIncome`)
- Saves incomes to localStorage
- Renders income history list
- Provides `getIncomeTotal()` method for Dashboard balance calculation

Methods:
- `constructor()` - Initialize form listeners, set today date, render
- `setupEventListeners()` - Listen to income form submit
- `setTodayDate()` - Set date input to today
- `handleAddIncome(e)` - Create income object, save, reset form, re-render
- `saveIncomes()` - Persist to localStorage
- `loadIncomes()` - Load from localStorage or return empty array
- `getIncomeTotal()` - Sum all incomes (used by Dashboard)
- `renderIncomeList()` - Display income history with formatting
- `formatDate()` - Reuse date formatting utility from BudgetApp

### 3. Balance Calculation (JavaScript)
**File:** `app.js` - BudgetApp class enhancement

Add new method:
- `getBalance()` - Returns: `incomeTotal - expenseTotal`

Update Dashboard to display balance:
- Add new section above category summary showing: "Solde Actuel: [balance]€"
- Style similar to category items (gradient card with prominent typography)
- Update whenever expenses or incomes change

---

## Data Flow

1. User opens My Income page
2. User fills form (Amount, Source, Date) and submits
3. IncomeApp validates and creates income object
4. Income saved to localStorage under `incomes` key
5. Form resets to today's date
6. Income history list re-renders
7. Balance on Dashboard automatically updates (reads both incomes and expenses)

---

## Integration Points

- **IncomeApp initialization:** Happens after BudgetApp (like Router)
- **Balance calculation:** BudgetApp queries IncomeApp.getIncomeTotal()
- **localStorage:** Separate keys (`incomes` vs `expenses`) for independence
- **Styling:** Reuse existing form and list CSS classes
- **Date formatting:** Share `formatDate()` utility between apps

---

## Error Handling & Validation

- Form validation handled by HTML5 `required` attribute
- localStorage failures: silent (no explicit error handling for initial load)
- Empty states: Show "Aucune revenu enregistré" placeholder text

---

## Testing Criteria

1. Add income via form → appears in history list immediately
2. Income persists after page reload
3. Balance on Dashboard updates when income added
4. Multiple incomes calculate correctly (sum)
5. Date input defaults to today
6. History list displays chronologically (newest first)
7. Styling matches Dashboard form aesthetic

---

## Future Considerations (Out of Scope)

- Delete/edit income
- Income categories (similar to expense categories)
- Recurring/scheduled income
- Income filtering by date range
