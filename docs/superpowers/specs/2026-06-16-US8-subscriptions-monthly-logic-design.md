# US#8 Design: Subscriptions Page Monthly Logic

> **Goal:** Create a functional monthly subscriptions manager that allows users to track recurring subscription costs and see the total monthly expense.

**Architecture:** SubscriptionsApp class manages monthly subscriptions stored in localStorage, calculates total monthly cost in real-time, and renders subscription cards with a prominent total monthly cost indicator card. Each subscription tracks name, monthly cost, and renewal day.

**Tech Stack:** Vanilla JavaScript (SubscriptionsApp class), HTML5, localStorage (`monthly_subscriptions` key), CSS3 (gradients, animations)

---

## Data Structure

### Subscription Object
```javascript
{
  id: timestamp,              // Unique identifier (Date.now())
  name: string,               // Subscription name (e.g., "Netflix", "Spotify")
  monthlyCost: number,        // Monthly cost (e.g., 9.99)
  renewalDay: number,         // Day of month to renew (1-31)
  createdDate: string         // Date created (YYYY-MM-DD)
}
```

### Monthly Total Calculation
```javascript
totalMonthly: number          // Sum of all monthlyCost values
```

---

## Components & Features

### 1. Subscriptions Section (HTML)
**File:** `index.html` #subscriptions section

Replace placeholder with:
- **Total Monthly Cost Card:**
  - Header: "Coût Total Mensuel"
  - Large amount display (e.g., "45,90€ / mois")
  - Dark blue/purple gradient background
  - Updates in real-time

- **Form to add subscriptions:**
  - Subscription Name input (text, required)
  - Monthly Cost input (number, step 0.01, required)
  - Renewal Day input (number 1-31, required)
  - Submit button "Ajouter l'Abonnement"

- **Subscriptions List:**
  - Container for subscription cards
  - Empty state message if no subscriptions
  - Each card displays:
    - Subscription name
    - Monthly cost ("X,XX€ / mois")
    - Renewal date ("Renouvelé le X de chaque mois")
    - Delete button

### 2. SubscriptionsApp Class (JavaScript)
**File:** `app.js`

New class managing all subscription operations:
- Loads subscriptions from localStorage on init
- Sets up form event listeners
- Handles subscription creation and deletion
- Saves subscriptions to localStorage under `monthly_subscriptions` key
- Calculates monthly total cost
- Renders subscription cards and updates total card in real-time

**Methods:**
- `constructor()` - Initialize, load subscriptions, setup listeners, render
- `setupEventListeners()` - Listen to form submit
- `handleAddSubscription(e)` - Create subscription, save, reset form, render
- `saveSubscriptions()` - Persist to localStorage
- `loadSubscriptions()` - Load from localStorage or return empty array
- `calculateMonthlyTotal()` - Returns sum of all monthly costs
- `renderSubscriptions()` - Display all subscription cards
- `renderMonthlyTotal()` - Update total cost card display
- `deleteSubscription(id)` - Remove subscription and re-render
- `formatCurrency(amount)` - Format as currency (French locale)

### 3. Subscription Cards Styling (CSS)
**File:** `style.css`

Add styles for:
- `.subscriptions-total-card` - Total card (dark blue/purple gradient)
- `.total-label` - "Coût Total Mensuel" label
- `.total-amount` - Amount display (large, white)
- `.subscriptions-list` - Container for cards
- `.subscription-card` - Individual card (white, shadow, hover)
- `.subscription-name` - Subscription name
- `.subscription-cost` - Monthly cost display
- `.subscription-renewal` - Renewal day text
- `.subscription-delete-btn` - Delete button

**Colors:**
- Gradient: `#2C3E50` (dark blue) → `#8B5A7F` (purple)
- Card text: #333 (dark gray)
- Delete button: #e74c3c (red)

**Animations:**
- Card hover: slight elevation and shadow increase
- Total card: subtle shadow on hover

---

## Data Flow

1. User fills subscription form (Name, Cost, Renewal Day)
2. Submits form
3. SubscriptionsApp creates subscription object with unique ID
4. Saves to localStorage under `monthly_subscriptions` key
5. Resets form
6. Recalculates monthly total
7. Updates total card display
8. Renders all subscriptions with new card added
9. On page reload, loads saved subscriptions and recalculates total

---

## localStorage Schema

```javascript
// Key: "monthly_subscriptions"
// Value: JSON array of subscription objects
[
  {
    id: 1718550000000,
    name: "Netflix",
    monthlyCost: 9.99,
    renewalDay: 15,
    createdDate: "2026-06-16"
  },
  {
    id: 1718550001000,
    name: "Spotify",
    monthlyCost: 9.99,
    renewalDay: 20,
    createdDate: "2026-06-16"
  },
  {
    id: 1718550002000,
    name: "Adobe Cloud",
    monthlyCost: 25.92,
    renewalDay: 1,
    createdDate: "2026-06-16"
  }
]
```

---

## Edge Cases & Empty States

- **No subscriptions:** List displays "Aucun abonnement enregistré"
- **Total card with no subscriptions:** Shows "0,00€ / mois"
- **Invalid renewal day:** Use 1-31 validation on input
- **Multiple subscriptions same day:** All valid, no conflict

---

## Testing Criteria

1. Add subscription via form → appears immediately in list
2. Subscription persists after page reload
3. Total monthly cost calculates correctly
4. Currency formatting correct (e.g., "9,99€")
5. Multiple subscriptions display in order (newest first)
6. Delete button removes subscription and updates total
7. Empty state displays when no subscriptions
8. Form resets after submission
9. Total card updates in real-time when adding/removing
10. All calculations accurate

---

## Future Considerations (Out of Scope)

- Edit existing subscriptions
- Category-based subscriptions (streaming, productivity, etc.)
- Subscription cost history/trends
- Alerts for upcoming renewals
- Integration with budget/goals for warning when total is too high
- Subscription recommendations based on spending patterns
