# US#7 Design: My Goals Page Saving Logic

> **Goal:** Create a functional saving goals manager that allows users to set savings targets and track their progress toward each goal with visual progress bars.

**Architecture:** GoalsApp class manages saving goals stored in localStorage, calculates progress metrics in real-time, and renders goal cards with animated progress bars. Each goal tracks name, target amount, and current saved amount.

**Tech Stack:** Vanilla JavaScript (GoalsApp class), HTML5, localStorage (`saving_goals` key)

---

## Data Structure

### Goal Object
```javascript
{
  id: timestamp,              // Unique identifier (Date.now())
  name: string,               // Goal name (e.g., "Vacances d'Été", "Voiture")
  targetAmount: number,       // Target savings amount (e.g., 1000)
  currentAmount: number,      // Currently saved amount (e.g., 300)
  createdDate: string         // Date created (YYYY-MM-DD)
}
```

### Progress Calculation
```javascript
{
  percentage: number,         // (currentAmount / targetAmount) * 100
  remaining: number,          // targetAmount - currentAmount
  isCompleted: boolean        // percentage >= 100
}
```

---

## Components & Features

### 1. My Goals Section (HTML)
**File:** `index.html` #goals section

Replace placeholder with:
- **Form to add goals:**
  - Goal Name input (text, required)
  - Target Amount input (number, step 0.01, required)
  - Current Saved Amount input (number, step 0.01, required, default 0)
  - Submit button "Ajouter l'Objectif"

- **Goals List:**
  - Container for goal cards
  - Empty state message if no goals
  - Each goal card displays:
    - Goal name as header
    - "XXX€ / XXXX€ sauvegardés" (progression)
    - "XXX€ à épargner" (remaining amount)
    - Progress bar with percentage
    - Delete button (optional for v1)

### 2. GoalsApp Class (JavaScript)
**File:** `app.js`

New class that manages all goal operations:
- Loads goals from localStorage on init
- Sets up form event listeners
- Handles goal creation and deletion
- Saves goals to localStorage under `saving_goals` key
- Calculates progress for each goal
- Renders goal cards with progress bars

**Methods:**
- `constructor()` - Initialize, load goals, setup listeners, render
- `setupEventListeners()` - Listen to form submit
- `handleAddGoal(e)` - Create goal, save, reset form, render
- `saveGoals()` - Persist to localStorage
- `loadGoals()` - Load from localStorage or return empty array
- `calculateProgress(goal)` - Returns {percentage, remaining, isCompleted}
- `renderGoals()` - Display all goal cards
- `deleteGoal(id)` - Remove goal and re-render
- `formatCurrency(amount)` - Format as currency

### 3. Goal Cards Styling (CSS)
**File:** `style.css`

Add styles for:
- `.goals-list` - Container for cards
- `.goals-card` - Individual goal card (white, shadow, hover)
- `.goal-header` - Goal name display
- `.goal-progress-text` - "XXX€ / XXXX€ sauvegardés"
- `.goal-remaining` - "XXX€ à épargner" (lighter text)
- `.goal-progress-bar-container` - Outer gray bar
- `.goal-progress-bar-fill` - Inner teal filled portion (animated)
- `.goal-percentage` - Percentage text display
- `.goal-delete-btn` - Delete button (optional)

**Animations:**
- Progress bar: width 0.8s cubic-bezier(0.4, 0, 0.2, 1)
- Card hover: slight elevation and shadow

---

## Data Flow

1. User fills goal form (Name, Target Amount, Current Amount)
2. Submits form
3. GoalsApp creates goal object with unique ID
4. Saves to localStorage under `saving_goals` key
5. Resets form
6. Renders all goals with progress bars
7. Progress bars animate from 0% to calculated percentage
8. On page reload, loads saved goals from localStorage

---

## localStorage Schema

```javascript
// Key: "saving_goals"
// Value: JSON array of goal objects
[
  {
    id: 1718550000000,
    name: "Vacances d'Été",
    targetAmount: 1000,
    currentAmount: 300,
    createdDate: "2026-06-16"
  },
  {
    id: 1718550001000,
    name: "Voiture",
    targetAmount: 5000,
    currentAmount: 1500,
    createdDate: "2026-06-16"
  }
]
```

---

## Edge Cases & Empty States

- **No goals:** Display "Aucun objectif enregistré"
- **Goal completed:** Progress bar shows 100%, still displays "0€ à épargner"
- **Current > Target:** Progress bar shows >100% (red/overflow state - tbd)
- **Current = 0:** Shows 0% progress, full remaining amount

---

## Testing Criteria

1. Add goal via form → appears immediately in list
2. Goal persists after page reload
3. Progress bar displays correct percentage
4. Currency formatting correct (e.g., "300,00€")
5. Progress bars animate on render (0→calculated%)
6. Multiple goals display in order (newest first)
7. Delete button removes goal and re-renders
8. Empty state displays when no goals
9. Form resets after submission
10. All calculations accurate

---

## Future Considerations (Out of Scope)

- Edit existing goals
- Mark goals as completed/archived
- Category-based goals
- Monthly/yearly goal tracking
- Goal notifications when target reached
- Import/export goals
