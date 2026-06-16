class CurrencyManager {
    constructor() {
        this.currency = this.loadCurrency();
        this.listeners = [];
        this.EUR_TO_USD = 1.10;
    }

    loadCurrency() {
        const saved = localStorage.getItem('app_currency');
        return saved === 'USD' ? 'USD' : 'EUR';
    }

    getCurrency() {
        return this.currency;
    }

    getSymbol() {
        return this.currency === 'USD' ? '$' : '€';
    }

    format(amount) {
        if (this.currency === 'USD') {
            const convertedAmount = amount * this.EUR_TO_USD;
            return convertedAmount.toFixed(2).replace('.', '.') + '$';
        } else {
            return amount.toFixed(2).replace('.', ',') + '€';
        }
    }

    setCurrency(code) {
        if (code !== 'EUR' && code !== 'USD') return;
        this.currency = code;
        localStorage.setItem('app_currency', code);
        this.notifyListeners();
    }

    onCurrencyChange(callback) {
        this.listeners.push(callback);
    }

    notifyListeners() {
        this.listeners.forEach(callback => callback(this.currency));
    }
}

// Create global instance
const currencyManager = new CurrencyManager();

class IncomeApp {
    constructor() {
        this.incomes = this.loadIncomes();
        this.form = document.getElementById('incomeForm');
        this.incomeAmountInput = document.getElementById('incomeAmount');
        this.incomeSourceInput = document.getElementById('incomeSource');
        this.incomeDateInput = document.getElementById('incomeDate');
        this.incomeList = document.getElementById('incomeList');

        this.setupEventListeners();
        this.setTodayDate();
        this.render();
        currencyManager.onCurrencyChange((currency) => this.onCurrencyChange(currency));
    }

    setupEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleAddIncome(e));
    }

    onCurrencyChange(newCurrency) {
        this.render();
    }

    setTodayDate() {
        const today = new Date().toISOString().split('T')[0];
        this.incomeDateInput.value = today;
    }

    handleAddIncome(e) {
        e.preventDefault();

        const income = {
            id: Date.now(),
            amount: parseFloat(this.incomeAmountInput.value),
            source: this.incomeSourceInput.value,
            date: this.incomeDateInput.value
        };

        this.incomes.push(income);
        this.saveIncomes();
        this.form.reset();
        this.setTodayDate();
        this.render();

        // Update Dashboard balance after income added
        if (window.budgetApp) {
            window.budgetApp.updateBalance();
        }
    }

    saveIncomes() {
        localStorage.setItem('incomes', JSON.stringify(this.incomes));
    }

    loadIncomes() {
        const stored = localStorage.getItem('incomes');
        return stored ? JSON.parse(stored) : [];
    }

    getIncomeTotal() {
        return this.incomes.reduce((sum, income) => sum + income.amount, 0);
    }

    renderIncomeList() {
        if (this.incomes.length === 0) {
            this.incomeList.innerHTML = '<p class="empty-message">Aucun revenu enregistré</p>';
            return;
        }

        const sorted = [...this.incomes].sort((a, b) => new Date(b.date) - new Date(a.date));

        this.incomeList.innerHTML = sorted
            .map(income => `
                <div class="expense-item">
                    <div class="expense-info">
                        <div class="expense-date">${this.formatDate(income.date)}</div>
                        <div class="expense-category">${income.source}</div>
                    </div>
                    <div class="expense-amount">${currencyManager.format(income.amount)}</div>
                </div>
            `)
            .join('');
    }

    formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    }

    render() {
        this.renderIncomeList();
    }
}

class RapportApp {
    constructor() {
        this.globalIncomeElement = document.getElementById('globalIncome');
        this.globalExpensesElement = document.getElementById('globalExpenses');
        this.globalBalanceElement = document.getElementById('globalBalance');
        this.ratioBarIncomeElement = document.getElementById('ratioBarIncome');
        this.ratioBarExpenseElement = document.getElementById('ratioBarExpense');
        this.categoryBarsContainer = document.getElementById('categoryBarsContainer');

        this.render();
        currencyManager.onCurrencyChange((currency) => this.onCurrencyChange(currency));
    }

    getCategoryColor(category) {
        const colors = {
            'Alimentation': '#0D8B8B',
            'Transport': '#2C5F7F',
            'Divertissement': '#7B4A9F',
            'Autre': '#6B7D8B'
        };
        return colors[category] || '#6B7D8B';
    }

    calculateGlobalStats() {
        const expenses = window.budgetApp ? window.budgetApp.expenses : [];
        const incomeApp = window.incomeApp;

        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const totalIncome = incomeApp ? incomeApp.getIncomeTotal() : 0;
        const balance = totalIncome - totalExpenses;

        const total = totalIncome + totalExpenses;
        const incomePercentage = total > 0 ? (totalIncome / total) * 100 : 0;
        const expensePercentage = total > 0 ? (totalExpenses / total) * 100 : 0;

        return {
            totalIncome,
            totalExpenses,
            balance,
            incomePercentage,
            expensePercentage
        };
    }

    calculateCategoryStats() {
        const expenses = window.budgetApp ? window.budgetApp.expenses : [];
        const categoryTotals = {};

        expenses.forEach(expense => {
            if (!categoryTotals[expense.category]) {
                categoryTotals[expense.category] = 0;
            }
            categoryTotals[expense.category] += expense.amount;
        });

        const totalExpenses = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);

        return Object.entries(categoryTotals)
            .map(([category, amount]) => ({
                category,
                amount,
                percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
                color: this.getCategoryColor(category)
            }))
            .sort((a, b) => b.amount - a.amount);
    }

    formatCurrency(amount) {
        return currencyManager.format(amount);
    }

    renderGlobalCard() {
        const stats = this.calculateGlobalStats();

        this.globalIncomeElement.textContent = this.formatCurrency(stats.totalIncome);
        this.globalExpensesElement.textContent = this.formatCurrency(stats.totalExpenses);
        this.globalBalanceElement.textContent = this.formatCurrency(stats.balance);

        this.ratioBarIncomeElement.style.width = stats.incomePercentage + '%';
        this.ratioBarExpenseElement.style.width = stats.expensePercentage + '%';
    }

    renderCategoryBars() {
        const categories = this.calculateCategoryStats();

        if (categories.length === 0) {
            this.categoryBarsContainer.innerHTML = '<p class="empty-message">Aucune dépense enregistrée</p>';
            return;
        }

        this.categoryBarsContainer.innerHTML = categories
            .map(cat => `
                <div class="category-bar-item">
                    <div class="category-label">
                        <span>${cat.category}</span>
                        <span class="category-amount">${this.formatCurrency(cat.amount)}</span>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar-fill" style="width: 0%; background-color: ${cat.color};">
                            <span class="percentage-text">${cat.percentage.toFixed(0)}%</span>
                        </div>
                    </div>
                    <div class="category-percentage">${cat.percentage.toFixed(1)}% du budget</div>
                </div>
            `)
            .join('');

        // Trigger animations by setting width after render
        setTimeout(() => {
            const fills = this.categoryBarsContainer.querySelectorAll('.progress-bar-fill');
            const categoryStats = this.calculateCategoryStats();
            fills.forEach((fill, index) => {
                if (categoryStats[index]) {
                    fill.style.width = categoryStats[index].percentage + '%';
                }
            });
        }, 10);
    }

    render() {
        this.renderGlobalCard();
        this.renderCategoryBars();
    }

    onCurrencyChange(newCurrency) {
        this.render();
    }
}

class GoalsApp {
    constructor() {
        this.goals = this.loadGoals();
        this.form = document.getElementById('goalsForm');
        this.goalNameInput = document.getElementById('goalName');
        this.goalTargetInput = document.getElementById('goalTarget');
        this.goalCurrentInput = document.getElementById('goalCurrent');
        this.goalsList = document.getElementById('goalsList');

        this.setupEventListeners();
        this.render();
        currencyManager.onCurrencyChange((currency) => this.onCurrencyChange(currency));
    }

    setupEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleAddGoal(e));
    }

    handleAddGoal(e) {
        e.preventDefault();

        const goal = {
            id: Date.now(),
            name: this.goalNameInput.value,
            targetAmount: parseFloat(this.goalTargetInput.value),
            currentAmount: parseFloat(this.goalCurrentInput.value),
            createdDate: new Date().toISOString().split('T')[0]
        };

        this.goals.push(goal);
        this.saveGoals();
        this.form.reset();
        this.render();
    }

    saveGoals() {
        localStorage.setItem('saving_goals', JSON.stringify(this.goals));
    }

    loadGoals() {
        const stored = localStorage.getItem('saving_goals');
        return stored ? JSON.parse(stored) : [];
    }

    calculateProgress(goal) {
        const percentage = goal.targetAmount > 0
            ? (goal.currentAmount / goal.targetAmount) * 100
            : 0;
        const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
        const isCompleted = percentage >= 100;

        return {
            percentage: Math.min(percentage, 100),
            remaining,
            isCompleted
        };
    }

    formatCurrency(amount) {
        return currencyManager.format(amount);
    }

    deleteGoal(id) {
        this.goals = this.goals.filter(goal => goal.id !== id);
        this.saveGoals();
        this.render();
    }

    renderGoals() {
        if (this.goals.length === 0) {
            this.goalsList.innerHTML = '<p class="empty-message">Aucun objectif enregistré</p>';
            return;
        }

        const sorted = [...this.goals].sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));

        this.goalsList.innerHTML = sorted
            .map(goal => {
                const progress = this.calculateProgress(goal);
                return `
                    <div class="goals-card">
                        <div class="goal-header">${goal.name}</div>
                        <div class="goal-progress-text">${this.formatCurrency(goal.currentAmount)} / ${this.formatCurrency(goal.targetAmount)} sauvegardés</div>
                        <div class="goal-remaining">${this.formatCurrency(progress.remaining)} à épargner</div>
                        <div class="goal-progress-bar-container">
                            <div class="goal-progress-bar-fill" style="width: 0%;">
                                <span class="goal-percentage">${progress.percentage.toFixed(0)}%</span>
                            </div>
                        </div>
                        <button class="goal-delete-btn" onclick="window.goalsApp.deleteGoal(${goal.id})">Supprimer</button>
                    </div>
                `;
            })
            .join('');

        // Trigger animations
        setTimeout(() => {
            const fills = this.goalsList.querySelectorAll('.goal-progress-bar-fill');
            const sortedGoals = [...this.goals].sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
            fills.forEach((fill, index) => {
                if (sortedGoals[index]) {
                    const progress = this.calculateProgress(sortedGoals[index]);
                    fill.style.width = progress.percentage + '%';
                }
            });
        }, 10);
    }

    render() {
        this.renderGoals();
    }

    onCurrencyChange(newCurrency) {
        this.render();
    }
}

class SubscriptionsApp {
    constructor() {
        this.subscriptions = this.loadSubscriptions();
        this.form = document.getElementById('subscriptionsForm');
        this.subscriptionNameInput = document.getElementById('subscriptionName');
        this.subscriptionCostInput = document.getElementById('subscriptionCost');
        this.subscriptionRenewalDayInput = document.getElementById('subscriptionRenewalDay');
        this.subscriptionsList = document.getElementById('subscriptionsList');
        this.monthlyTotalElement = document.getElementById('monthlyTotal');

        this.setupEventListeners();
        this.render();
        currencyManager.onCurrencyChange((currency) => this.onCurrencyChange(currency));
    }

    setupEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleAddSubscription(e));
    }

    handleAddSubscription(e) {
        e.preventDefault();

        const subscription = {
            id: Date.now(),
            name: this.subscriptionNameInput.value,
            monthlyCost: parseFloat(this.subscriptionCostInput.value),
            renewalDay: parseInt(this.subscriptionRenewalDayInput.value),
            createdDate: new Date().toISOString().split('T')[0]
        };

        this.subscriptions.push(subscription);
        this.saveSubscriptions();
        this.form.reset();
        this.render();
    }

    saveSubscriptions() {
        localStorage.setItem('monthly_subscriptions', JSON.stringify(this.subscriptions));
    }

    loadSubscriptions() {
        const stored = localStorage.getItem('monthly_subscriptions');
        return stored ? JSON.parse(stored) : [];
    }

    calculateMonthlyTotal() {
        return this.subscriptions.reduce((sum, sub) => sum + sub.monthlyCost, 0);
    }

    formatCurrency(amount) {
        return currencyManager.format(amount);
    }

    deleteSubscription(id) {
        this.subscriptions = this.subscriptions.filter(sub => sub.id !== id);
        this.saveSubscriptions();
        this.render();
    }

    renderMonthlyTotal() {
        const total = this.calculateMonthlyTotal();
        this.monthlyTotalElement.textContent = this.formatCurrency(total) + ' / mois';
    }

    renderSubscriptions() {
        if (this.subscriptions.length === 0) {
            this.subscriptionsList.innerHTML = '<p class="empty-message">Aucun abonnement enregistré</p>';
            return;
        }

        const sorted = [...this.subscriptions].sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));

        this.subscriptionsList.innerHTML = sorted
            .map(sub => `
                <div class="subscription-card">
                    <div class="subscription-name">${sub.name}</div>
                    <div class="subscription-cost">${this.formatCurrency(sub.monthlyCost)} / mois</div>
                    <div class="subscription-renewal">Renouvelé le ${sub.renewalDay} de chaque mois</div>
                    <button class="subscription-delete-btn" onclick="window.subscriptionsApp.deleteSubscription(${sub.id})">Supprimer</button>
                </div>
            `)
            .join('');
    }

    render() {
        this.renderMonthlyTotal();
        this.renderSubscriptions();
    }

    onCurrencyChange(newCurrency) {
        this.render();
    }
}

class SettingsApp {
    constructor() {
        this.currencySelect = document.getElementById('currencySelect');
        this.resetButton = document.getElementById('resetButton');

        this.setupEventListeners();
        this.initializeCurrencySelect();
    }

    initializeCurrencySelect() {
        const currentCurrency = currencyManager.getCurrency();
        this.currencySelect.value = currentCurrency;
    }

    setupEventListeners() {
        if (this.currencySelect) {
            this.currencySelect.addEventListener('change', (e) => {
                localStorage.setItem('app_currency', e.target.value);
                localStorage.setItem('current_page', 'settings');
                location.reload();
            });
        }
        this.resetButton.addEventListener('click', (e) => this.handleReset(e));
    }

    handleReset(e) {
        e.preventDefault();
        const confirmed = confirm('Voulez-vous vraiment réinitialiser toutes vos données ?');
        if (confirmed) {
            localStorage.clear();
            location.reload();
        }
    }
}

class Router {
    constructor() {
        const savedPage = localStorage.getItem('current_page');
        this.currentPage = savedPage || 'dashboard';
        this.setupEventListeners();
        this.navigateTo(this.currentPage);
    }

    setupEventListeners() {
        // Listen for nav button clicks
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                this.navigateTo(page);
            });
        });
    }

    navigateTo(page) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(section => {
            section.classList.remove('active');
        });

        // Remove active state from all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Show target page
        const targetSection = document.getElementById(page);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Mark nav link as active
        const activeLink = document.querySelector(`[data-page="${page}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        this.currentPage = page;
        localStorage.setItem('current_page', page);
    }
}

class BudgetApp {
    constructor() {
        this.expenses = this.loadExpenses();
        this.form = document.getElementById('expenseForm');
        this.amountInput = document.getElementById('amount');
        this.categoryInput = document.getElementById('category');
        this.dateInput = document.getElementById('date');
        this.expensesList = document.getElementById('expensesList');
        this.categorySummary = document.getElementById('categorySummary');

        this.setupEventListeners();
        this.setTodayDate();
        this.render();
        currencyManager.onCurrencyChange((currency) => this.onCurrencyChange(currency));

        // Initialize Router after BudgetApp is ready
        this.router = new Router();
    }

    setupEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleAddExpense(e));
    }

    setTodayDate() {
        const today = new Date().toISOString().split('T')[0];
        this.dateInput.value = today;
    }

    handleAddExpense(e) {
        e.preventDefault();

        const expense = {
            id: Date.now(),
            amount: parseFloat(this.amountInput.value),
            category: this.categoryInput.value,
            date: this.dateInput.value
        };

        this.expenses.push(expense);
        this.saveExpenses();
        this.form.reset();
        this.setTodayDate();
        this.render();
    }

    saveExpenses() {
        localStorage.setItem('expenses', JSON.stringify(this.expenses));
    }

    loadExpenses() {
        const stored = localStorage.getItem('expenses');
        return stored ? JSON.parse(stored) : [];
    }

    getCategorySummary() {
        const summary = {};
        this.expenses.forEach(expense => {
            if (!summary[expense.category]) {
                summary[expense.category] = 0;
            }
            summary[expense.category] += expense.amount;
        });
        return summary;
    }

    renderCategorySummary() {
        const summary = this.getCategorySummary();

        if (Object.keys(summary).length === 0) {
            this.categorySummary.innerHTML = '<p class="empty-message">Aucune dépense pour le moment</p>';
            this.updateBalance();
            return;
        }

        this.categorySummary.innerHTML = Object.entries(summary)
            .sort((a, b) => b[1] - a[1])
            .map(([category, total]) => `
                <div class="category-item">
                    <div class="category-name">${category}</div>
                    <div class="category-total">${currencyManager.format(total)}</div>
                </div>
            `)
            .join('');

        this.updateBalance();
    }

    renderExpensesList() {
        if (this.expenses.length === 0) {
            this.expensesList.innerHTML = '<p class="empty-message">Aucune dépense enregistrée</p>';
            return;
        }

        const sorted = [...this.expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

        this.expensesList.innerHTML = sorted
            .map(expense => `
                <div class="expense-item">
                    <div class="expense-info">
                        <div class="expense-date">${this.formatDate(expense.date)}</div>
                        <div class="expense-category">${expense.category}</div>
                    </div>
                    <div class="expense-amount">${currencyManager.format(expense.amount)}</div>
                </div>
            `)
            .join('');
    }

    formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    }

    render() {
        this.renderCategorySummary();
        this.renderExpensesList();
    }

    getBalance() {
        const expenseTotal = this.expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const incomeTotal = window.incomeApp ? window.incomeApp.getIncomeTotal() : 0;
        return incomeTotal - expenseTotal;
    }

    updateBalance() {
        const balanceElement = document.getElementById('balanceAmount');
        if (balanceElement) {
            const balance = this.getBalance();
            balanceElement.textContent = currencyManager.format(balance);
        }
    }

    onCurrencyChange(newCurrency) {
        this.render();
        this.updateBalance();
    }
}

function updateCurrencyLabels() {
    const currentSymbol = currencyManager.getSymbol();
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    let node;
    while (node = walker.nextNode()) {
        const text = node.textContent;
        if (text.includes('(€)') || text.includes('($)')) {
            node.textContent = text.replace(/\([€$]\)/g, `(${currentSymbol})`);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const budgetApp = new BudgetApp();
    const incomeApp = new IncomeApp();
    const rapportApp = new RapportApp();
    const goalsApp = new GoalsApp();
    const subscriptionsApp = new SubscriptionsApp();
    const settingsApp = new SettingsApp();

    // Store references globally so they can access each other
    window.budgetApp = budgetApp;
    window.incomeApp = incomeApp;
    window.rapportApp = rapportApp;
    window.goalsApp = goalsApp;
    window.subscriptionsApp = subscriptionsApp;
    window.settingsApp = settingsApp;

    // Update all currency labels to match current currency
    updateCurrencyLabels();

    // Initialize Router after all apps are ready
    new Router();

    // Set initial balance
    budgetApp.updateBalance();
});
