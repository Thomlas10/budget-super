# US#9 Design: Settings Page Currency & Reset Functionality

> **Goal:** Create a settings management system with global currency preference and application reset capability that impacts all currency displays across the entire app.

**Architecture:** CurrencyManager class provides global currency handling accessible by all existing classes. SettingsApp manages currency preference (saved to localStorage) and reset functionality. All classes (BudgetApp, IncomeApp, RapportApp, GoalsApp, SubscriptionsApp) delegate currency formatting to CurrencyManager instead of using hardcoded symbols.

**Tech Stack:** Vanilla JavaScript (CurrencyManager, SettingsApp classes), HTML5, CSS3, localStorage (`app_currency` key)

---

## Data Structure

### Currency Manager
```javascript
// Manages global currency state
{
  currency: "EUR" | "USD",      // Current currency code
  symbol: "€" | "$",            // Display symbol
  locale: "fr-FR" | "en-US"     // For number formatting
}
```

### localStorage
```javascript
// Key: "app_currency"
// Value: "EUR" or "USD"
```

---

## Components & Features

### 1. Settings Section (HTML)
**File:** `index.html` #settings section

Replace placeholder with:
- **Currency Preference Card:**
  - Header: "Préférence de Devise"
  - Dropdown select with options:
    - "Euro (€)"
    - "Dollar ($)"
  - Description text
  - Default to "Euro (€)"

- **Danger Zone Card:**
  - Header: "Zone de Danger" (red)
  - Warning text: "Les actions dans cette section sont irréversibles"
  - Red button: "Réinitialiser l'application"
  - Visually distinct with red border

### 2. CurrencyManager Class (JavaScript)
**File:** `app.js` (new utility class)

Singleton-like manager that:
- Loads currency from localStorage on init
- Provides global currency symbol and code
- Formats amounts using selected currency and locale
- Handles currency changes
- Notifies all apps when currency changes

**Methods:**
- `constructor()` - Initialize, load currency from localStorage
- `getCurrency()` - Returns "EUR" or "USD"
- `getSymbol()` - Returns "€" or "$"
- `format(amount)` - Returns formatted string with correct currency
- `setCurrency(code)` - Change currency, save to localStorage, trigger updates
- `onCurrencyChange(callback)` - Register callback for when currency changes

**Public instance:**
- `window.currencyManager` - Global access point

### 3. SettingsApp Class (JavaScript)
**File:** `app.js`

New class managing settings:
- Loads currency preference
- Initializes currency dropdown with current selection
- Listens to dropdown changes
- Manages reset button with confirmation dialog
- Triggers re-render of all apps when currency changes
- Clears all localStorage and reloads on reset

**Methods:**
- `constructor()` - Initialize, load settings, setup listeners
- `setupEventListeners()` - Listen dropdown & reset button
- `handleCurrencyChange(e)` - Change currency, update all apps
- `handleReset()` - Show confirmation, clear localStorage, reload
- `updateAllApps()` - Force re-render of all apps

### 4. Refactor All Existing Classes
**File:** `app.js` (update BudgetApp, IncomeApp, RapportApp, GoalsApp, SubscriptionsApp)

**CRITICAL CHANGES:**
Replace all instances of individual `formatCurrency()` methods with calls to:
```javascript
window.currencyManager.format(amount)
```

**Classes to update:**
1. **BudgetApp:**
   - Remove or keep `formatCurrency()` but use `currencyManager.format()`
   - Update all rendering methods to use global formatter

2. **IncomeApp:**
   - Remove `formatCurrency()` method
   - Update all calls to use `currencyManager.format()`

3. **RapportApp:**
   - Remove `formatCurrency()` method
   - Update all calls to use `currencyManager.format()`

4. **GoalsApp:**
   - Remove `formatCurrency()` method
   - Update all calls to use `currencyManager.format()`

5. **SubscriptionsApp:**
   - Remove `formatCurrency()` method
   - Update all calls to use `currencyManager.format()`

**Key pattern:**
```javascript
// OLD:
this.formatCurrency(100)  // Returns "100,00€"

// NEW:
window.currencyManager.format(100)  // Returns "100,00€" or "100.00$" based on preference
```

### 5. Settings Cards Styling (CSS)
**File:** `style.css`

Add styles for:
- `.settings-cards-container` - Container for both cards
- `.settings-card` - Individual card (white, shadow)
- `.currency-preference-card` - Currency selection card
- `.danger-zone-card` - Danger zone card (red border, distinct)
- `.settings-label` - Label text
- `#currencySelect` - Dropdown styling
- `.reset-button` - Danger button (red, prominent)

**Danger Zone Styling:**
- Border: 2-3px solid #e74c3c (red)
- Background: white with subtle red tint
- Button: prominent red, hover darkens significantly
- Clear visual hierarchy warning

---

## Data Flow

1. SettingsApp initializes on page load
2. Loads current currency from localStorage
3. Sets dropdown to current selection
4. User changes dropdown
5. SettingsApp calls `currencyManager.setCurrency(code)`
6. CurrencyManager saves to localStorage
7. CurrencyManager triggers all registered callbacks
8. SettingsApp calls `updateAllApps()` to re-render
9. All apps fetch latest data and render using `currencyManager.format()`

**Reset flow:**
1. User clicks reset button
2. Confirmation dialog shown
3. If confirmed: localStorage cleared, page reloaded
4. Fresh app starts with default EUR currency

---

## localStorage Schema

```javascript
// Key: "app_currency"
// Value: "EUR" or "USD"
// Default: "EUR" if not set
```

---

## Integration Points

**Initialization order:**
1. CurrencyManager initializes first
2. All other apps initialize (will use CurrencyManager for formatting)
3. SettingsApp initializes last

**Update flow when currency changes:**
1. SettingsApp detects change
2. Calls currencyManager.setCurrency()
3. CurrencyManager notifies SettingsApp
4. SettingsApp calls updateAllApps()
5. Each app re-renders with new currency

---

## Edge Cases & Considerations

- **Page reload after currency change:** localStorage persists, currency loads correctly
- **Reset while on any page:** All data cleared, app reloads with defaults
- **Invalid currency:** Validate to "EUR" or "USD" only
- **Formatting consistency:** All amounts use currencyManager.format()
- **Locale awareness:** "€" with comma separator, "$" with period separator

---

## Testing Criteria

1. Currency dropdown displays current selection
2. Changing dropdown updates all amounts on current page
3. Switching pages shows amounts in selected currency
4. Currency persists after page reload
5. Confirmation dialog appears on reset click
6. Canceling reset does nothing
7. Confirming reset clears all localStorage
8. Reset reloads page cleanly
9. Page reloads with default EUR and empty data
10. All 5 apps correctly format amounts using currencyManager

---

## Future Considerations (Out of Scope)

- Additional currencies (GBP, JPY, etc.)
- Currency conversion rates
- Locale-specific number formatting options
- Settings export/import
- Theme preferences (dark mode)
- Data backup before reset
