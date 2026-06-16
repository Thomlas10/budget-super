class Router {
    constructor() {
        this.currentPage = 'dashboard';
        this.setupEventListeners();
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
            return;
        }

        this.categorySummary.innerHTML = Object.entries(summary)
            .sort((a, b) => b[1] - a[1])
            .map(([category, total]) => `
                <div class="category-item">
                    <div class="category-name">${category}</div>
                    <div class="category-total">${total.toFixed(2)}€</div>
                </div>
            `)
            .join('');
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
                    <div class="expense-amount">${expense.amount.toFixed(2)}€</div>
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
}

document.addEventListener('DOMContentLoaded', () => {
    new BudgetApp();
});
