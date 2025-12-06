# **Project Roadmap: Nexa**

**Version:** 1.1  
**Last Updated:** December 6, 2025  
**Status:** Active Development (Phases 1-3 Complete, Phase 4 In Progress)  
**Development Methodology:** Agile (Sprint-based)

---

## **Overview**

This roadmap outlines the development phases, milestones, and tasks for building Nexa, a personal finance Progressive Web App. The project follows an iterative, agile approach with sprints typically lasting 1-2 weeks.

**Legend:**

- ✅ Completed
- 🚧 In Progress
- ⏳ Pending
- 🔄 Blocked

---

## **Phase 1: Foundation & Project Setup**

**Goal:** Establish core infrastructure, dependencies, and development environment.

**Estimated Duration:** 1-2 Sprints

### **Milestone 1.1: Core Dependencies & Package Setup**

- [x] **Task 1.1.1:** Create `packages/validators` package ✅
  - [x] Initialize package structure with `package.json`
  - [x] Install `zod` dependency
  - [x] Create base schemas: `CurrencyEnum`, `TransactionTypeEnum`, `AccountTypeEnum`, `CategoryTypeEnum`
  - [x] Create `UserProfileSchema` with currency, fiscalType, onboardingCompleted
  - [x] Create `AccountSchema` with name, type, currentBalance, isArchived
  - [x] Create `CategorySchema` with name, type, color, icon, monthlyBudgetCap
  - [x] Create `TransactionSchema` (base) with amount, accountId (required), categoryId (optional, required via refinement for INCOME/EXPENSE), date, description, type, isRecurring
  - [x] Create income-specific fields: grossAmount, deductions within TransactionSchema
  - [x] Create transfer-specific field: toAccountId within TransactionSchema with refinements
  - [x] Create `RecurringRuleSchema` with name, amount, type, cronExpressionOrDay, accountId, categoryId, lastRunDate
  - [x] Create update schemas using `.partial()` for edit operations
  - [x] Export all TypeScript types using `z.infer<>`
  - [x] Add package to workspace and configure exports

- [x] **Task 1.1.2:** Install and configure TanStack Query in `apps/web` ✅
  - [x] Install `@tanstack/react-query` (v5)
  - [x] Create `lib/queries/keys.ts` with Query Key Factories
    - [x] `transactionKeys` factory (all, lists, list with filters, details, detail)
    - [x] `accountKeys` factory
    - [x] `categoryKeys` factory
    - [x] `recurringRuleKeys` factory
    - [x] `userKeys` factory
  - [x] Create `lib/queries/queryClient.ts` with QueryClient configuration
  - [x] Set up QueryClientProvider in root `app/layout.tsx`
  - [x] Configure default query options (staleTime, cacheTime, retry logic)

- [x] **Task 1.1.3:** Install and configure React Hook Form + Zod Resolver ✅
  - [x] Install `react-hook-form` and `@hookform/resolvers`
  - [x] Create form utilities in `lib/utils/form.ts`
  - [x] Set up form error handling patterns

- [x] **Task 1.1.4:** Install and configure T3 Env ✅
  - [x] Install `@t3-oss/env-nextjs`
  - [x] Create `apps/web/env.mjs` with server and client environment variable schemas
  - [x] Migrate existing `.env.local` variables to T3 Env
  - [x] Update `lib/firebase.ts` to use validated env variables
  - [x] Add validation for all Firebase config variables

- [x] **Task 1.1.5:** Install charting library (Recharts) ✅
  - [x] Install `recharts` in `apps/web`
  - [x] Create `lib/utils/chart.ts` with chart configuration utilities
  - [x] Set up chart theme colors matching design system

- [ ] **Task 1.1.6:** Standardize TypeScript versions
  - [ ] Update all packages to TypeScript 5.7.3
  - [ ] Verify type checking across workspace
  - [ ] Update `turbo.json` to include `check-types` task

### **Milestone 1.2: Firebase Infrastructure Refactoring**

- [x] **Task 1.2.1:** Refactor Firebase client structure ✅
  - [x] Create `lib/firebase/client.ts` (move from `lib/firebase.ts`)
  - [x] Export `app`, `db`, `auth`, `analytics` from client.ts
  - [x] Create `lib/firebase/collections.ts` with typed collection references
    - [x] Implement `createConverter<T>()` helper with Timestamp handling
    - [x] Create `getTransactionsRef(userId)` with converter
    - [x] Create `getAccountsRef(userId)` with converter
    - [x] Create `getCategoriesRef(userId)` with converter
    - [x] Create `getRecurringRulesRef(userId)` with converter
    - [x] Create `getUserDoc(userId)` with converter
    - [x] Create document reference helpers for all entities
  - [x] Create `lib/firebase/admin.ts` (server-only) for Firebase Admin SDK
  - [x] Update all imports across codebase

- [x] **Task 1.2.2:** Implement Firestore Security Rules ✅
  - [x] Update `firestore.rules` with proper security rules
  - [x] Create `isOwner(userId)` helper function
  - [x] Create validation functions: `isValidTransaction()`, `isValidAccount()`, `isValidCategory()`
  - [x] Implement rules for all subcollections (transactions, accounts, categories, recurring_rules)
  - [x] Add read-only field protection (e.g., currentBalance only updatable by Cloud Functions)
  - [ ] Test rules with Firebase Emulator
  - [ ] Deploy rules to Firebase project

- [x] **Task 1.2.3:** Configure Firestore Indexes ✅
  - [x] Add composite index for transactions: `date` (DESC), `type`, `accountId`
  - [x] Add index for recurring rules: `cronExpressionOrDay`, `lastRunDate`
  - [x] Add index for categories: `type` (for 50/30/20 filtering)
  - [x] Update `firestore.indexes.json`
  - [ ] Deploy indexes to Firebase

- [x] **Task 1.2.4:** Set up Firebase Cloud Functions structure ✅
  - [x] Create `functions/src/triggers/` directory
  - [x] Create `functions/src/scheduled/` directory
  - [x] Update `functions/src/index.ts` to export all functions
  - [x] Implement Balance Keeper function (`onTransactionWrite.ts`)
  - [x] Implement Recurring Engine function (`processRecurringRules.ts`)
  - [x] Configure function deployment settings

### **Milestone 1.3: UI Foundation & Utilities**

- [x] **Task 1.3.1:** Create utility functions 🚧 (Partially Complete)
  - [x] Create `lib/utils.ts` with `cn()` helper (clsx + tailwind-merge)
  - [ ] Create `lib/utils/format.ts` with currency, date, number formatters
  - [ ] Create `lib/utils/calculations.ts` with net pay, budget calculations
  - [ ] Export utilities from `lib/utils/index.ts`

- [ ] **Task 1.3.2:** Set up shadcn/ui components in `packages/ui`
  - [ ] Install required Radix UI dependencies
  - [ ] Add Card component (`ui/card`)
  - [ ] Add Button component (`ui/button`)
  - [ ] Add Form components (`ui/form`, `ui/input`, `ui/label`, `ui/select`)
  - [ ] Add Data Table component (`ui/data-table`)
  - [ ] Add Toast/Toaster component (`ui/toast`)
  - [ ] Add Dialog component (`ui/dialog`)
  - [ ] Configure component exports

- [ ] **Task 1.3.3:** Create base UI components in `apps/web/components/ui`
  - [ ] Import and re-export from `@workspace/ui`
  - [ ] Create any app-specific UI wrappers

---

## **Phase 2: Authentication & User Management** ✅

**Goal:** Implement secure authentication flow and user profile management.

**Estimated Duration:** 1 Sprint

**Status:** ✅ Completed

### **Milestone 2.1: Authentication Infrastructure** ✅

- [x] **Task 2.1.1:** Create authentication context and provider ✅
  - [x] Create `lib/contexts/AuthContext.tsx`
  - [x] Implement `AuthProvider` component with Firebase Auth state
  - [x] Create `useAuth()` hook for consuming auth context
  - [x] Handle auth state changes (onAuthStateChanged)
  - [x] Add loading and error states
  - [x] Integrate AuthProvider in root layout
  - [x] Implement email/password authentication methods
  - [x] Implement Google OAuth authentication

- [x] **Task 2.1.2:** Implement Next.js middleware for route protection ✅
  - [x] Create `apps/web/middleware.ts`
  - [x] Implement route protection for `/dashboard/*` routes
  - [x] Add redirect logic for authenticated users accessing auth pages
  - [x] Configure middleware matcher for specific routes
  - [ ] Test middleware with Firebase Auth tokens (deferred to testing phase)

- [x] **Task 2.1.3:** Create authentication pages ✅
  - [x] Create `app/(auth)/layout.tsx` (public layout with split-screen design)
  - [x] Create `app/(auth)/login/page.tsx`
    - [x] Email/Password login form
    - [x] Google OAuth button
    - [x] Form validation with Zod
    - [x] Error handling and display
    - [x] Redirect to dashboard on success
    - [x] Split-screen layout matching design reference
  - [x] Create `app/(auth)/signup/page.tsx`
    - [x] Email/Password signup form
    - [x] Google OAuth button
    - [x] Password confirmation field
    - [x] Form validation with Zod
    - [x] Split-screen layout matching design reference
  - [ ] Create `app/(auth)/verify-email/page.tsx` (email verification page - deferred)

### **Milestone 2.2: User Profile & Onboarding** ✅

- [x] **Task 2.2.1:** Create user profile management ✅
  - [x] Create `lib/hooks/useUserProfile.ts` hook
  - [x] Create TanStack Query hooks for user profile CRUD
  - [x] Implement `useUserProfile()` query hook
  - [x] Implement `useCreateUserProfile()` mutation hook
  - [x] Implement `useUpdateUserProfile()` mutation hook
  - [x] Integrate with Firestore collections

- [x] **Task 2.2.2:** Implement onboarding wizard ✅
  - [x] Create `app/(auth)/onboarding/page.tsx`
  - [x] Step 1: Currency Selection (ZMW default, USD, GBP, ZAR, EUR)
  - [x] Step 2: Fiscal Profile Selection (Salaried vs Freelance)
  - [x] Step 3: Review & Complete
  - [x] Create onboarding form with multi-step navigation
  - [x] Progress bar indicator
  - [x] Save onboarding data to Firestore
  - [x] Set `onboardingCompleted` flag
  - [x] Redirect to dashboard after completion
  - [ ] Initial Balance Setup (deferred to Phase 3 - Account Management)

- [x] **Task 2.2.3:** Create user settings page ✅
  - [x] Create `app/(dashboard)/settings/page.tsx`
  - [x] Display user profile information
  - [x] Allow editing currency and fiscal type
  - [x] Add logout functionality
  - [ ] Add account deletion functionality (deferred to future phase)

---

## **Phase 3: Accounts & Asset Management**

**Goal:** Implement account management and balance tracking.

**Estimated Duration:** 1 Sprint

### **Milestone 3.1: Account CRUD Operations** ✅

- [x] **Task 3.1.1:** Create account management hooks ✅
  - [x] Create `lib/hooks/useAccounts.ts` with TanStack Query
  - [x] Implement `useAccounts()` query hook
  - [x] Implement `useCreateAccount()` mutation hook (with undefined field filtering)
  - [x] Implement `useUpdateAccount()` mutation hook (with undefined field filtering)
  - [x] Implement `useDeleteAccount()` mutation hook
  - [x] Implement `useArchiveAccount()` mutation hook (soft delete)
  - [x] Add optimistic updates

- [x] **Task 3.1.2:** Create account form component ✅
  - [x] Create `components/forms/AccountForm.tsx`
  - [x] Form fields: name, type (CASH, BANK, MOBILE_MONEY, SAVINGS), initialBalance
  - [x] Use React Hook Form with Zod validation
  - [x] Handle create and edit modes
  - [x] Add form validation and error handling
  - [x] Visual account type selection with cards

- [x] **Task 3.1.3:** Create accounts page ✅
  - [x] Create `app/(dashboard)/accounts/page.tsx`
  - [x] Display list of accounts with cards
  - [x] Show account balance, type, and name
  - [x] Add "Create Account" button
  - [x] Add edit and delete actions
  - [x] Implement account archiving functionality
  - [x] Modal-based forms for create/edit
  - [x] Empty state with CTA
  - [x] Mobile responsive layout

- [ ] **Task 3.1.4:** Implement manual balance reconciliation ⏸️ (Deferred to Phase 4)
  - [ ] Add "Adjust Balance" feature to account cards
  - [ ] Create balance adjustment dialog/form
  - [ ] Create adjustment transaction automatically
  - [ ] Update account balance via transaction

### **Milestone 3.2: Account Balance Display** ✅

- [x] **Task 3.2.1:** Create account balance widgets ✅
  - [x] Create `components/widgets/AccountCard.tsx`
  - [x] Display account name, type, current balance
  - [x] Add account icon based on type
  - [x] Show balance in user's currency
  - [x] Add hover effects and interactions
  - [x] Edit/Archive/Delete actions

- [x] **Task 3.2.2:** Create total net worth calculation ✅
  - [x] Create `lib/utils/netWorth.ts` utility
  - [x] Calculate total assets (sum of all account balances)
  - [x] Filter archived accounts from calculations
  - [x] Display on dashboard

---

## **Phase 4: Transaction Management** 👷 85% Complete

**Goal:** Implement transaction tracking, categorization, and quick entry.

**Estimated Duration:** 2 Sprints

### **Milestone 4.1: Transaction CRUD Operations** 👷 90% Complete

- [x] **Task 4.1.1:** Create transaction management hooks ✅
  - [x] Create `lib/hooks/useTransactions.ts` with TanStack Query
  - [x] Implement `useTransactions()` query hook with filters
  - [x] Implement `useCreateTransaction()` mutation hook (with undefined filtering + date conversion)
  - [x] Implement `useUpdateTransaction()` mutation hook (with undefined filtering + date conversion)
  - [x] Implement `useDeleteTransaction()` mutation hook
  - [x] Add date range filtering support
  - [x] Add account and category filtering
  - [x] Add type filtering (INCOME, EXPENSE, TRANSFER)
  - [x] Add 50-record default limit when no date range
  - [x] Add optimistic updates

- [x] **Task 4.1.2:** Create transaction form component ✅
  - [x] Create `components/forms/TransactionForm.tsx`
  - [x] Form fields: amount, type (INCOME, EXPENSE, TRANSFER), accountId, categoryId, date, description
  - [x] Dynamic "To Account" field for TRANSFER type
  - [x] Income-specific fields: grossAmount, deductions (Advanced Mode)
  - [x] Simple Mode vs Advanced Mode toggle for income
  - [x] Auto-calculate Net Pay from Gross - Deductions
  - [x] Visual account/category selection
  - [x] Use React Hook Form with Zod validation
  - [x] Handle create and edit modes
  - [x] Add form validation and error handling
  - [x] Show loading state during submission
  - [x] Conditional logic: Transfer shows 2 accounts, Income/Expense shows category

- [x] **Task 4.1.3:** Create transactions page ✅
  - [x] Create `app/(dashboard)/transactions/page.tsx`
  - [x] Display transactions in data table
  - [x] Add filters: type (ALL, INCOME, EXPENSE, TRANSFER)
  - [x] Add sorting by date (descending)
  - [x] Add "Add Transaction" button
  - [x] Add edit and delete actions (with confirmation)
  - [x] Modal-based transaction form
  - [x] Empty state with CTA
  - [x] Color-coded transactions (green=income, red=expense, blue=transfer)
  - [x] Show transfer destination account
  - [ ] Add date range filter
  - [ ] Add account filter
  - [ ] Add category filter
  - [ ] Add search functionality
  - [ ] Show transaction details in expandable rows

- [ ] **Task 4.1.4:** Implement quick add expense (3-click rule) ⏳
  - [ ] Create quick add expense dialog/modal
  - [ ] Pre-fill current date and default account
  - [ ] Show category quick-select buttons
  - [ ] Minimize form fields for speed
  - [ ] Add keyboard shortcuts

- [ ] **Task 4.1.5:** Connect dashboard monthly widgets ⏳
  - [ ] Calculate Monthly Income from transactions (current month)
  - [ ] Calculate Monthly Expenses from transactions (current month)
  - [ ] Update `dashboard/page.tsx` with real data
  - [ ] Remove placeholder values

### **Milestone 4.2: Category Management** 👷 70% Complete

- [x] **Task 4.2.1:** Create category management hooks ✅
  - [x] Create `lib/hooks/useCategories.ts` with TanStack Query
  - [x] Implement `useCategories()` query hook
  - [x] Implement `useCreateCategory()` mutation hook (with undefined filtering)
  - [x] Implement `useUpdateCategory()` mutation hook
  - [x] Implement `useDeleteCategory()` mutation hook
  - [x] Filter categories by type (NEEDS, WANTS, SAVINGS, INCOME)

- [ ] **Task 4.2.2:** Create category form component
  - [ ] Create `components/forms/CategoryForm.tsx`
  - [ ] Form fields: name, type, color (color picker), icon (Lucide icon selector), monthlyBudgetCap
  - [ ] Use React Hook Form with Zod validation
  - [ ] Handle create and edit modes
  - [ ] Show color and icon preview

- [ ] **Task 4.2.3:** Set up default categories ⏳
  - [ ] Create seed data for default categories
  - [ ] Create Cloud Function or migration script to initialize default categories
  - [ ] Default categories: Transport, Food, Rent, Utilities, Entertainment, etc.
  - [ ] Assign appropriate types (NEEDS, WANTS, SAVINGS, INCOME)
  - [ ] Auto-assign colors and icons

- [ ] **Task 4.2.4:** Create category management UI ⏳
  - [ ] Create `/categories` page or add to settings
  - [ ] Display categories with color and icon
  - [ ] Add create, edit, delete actions
  - [ ] Show category usage statistics
  - [ ] Group by type (NEEDS, WANTS, SAVINGS, INCOME)

### **Milestone 4.3: Transaction Features**

- [ ] **Task 4.3.1:** Implement receipt image upload
  - [ ] Add Firebase Storage integration
  - [ ] Create file upload component
  - [ ] Add image upload to transaction form
  - [ ] Store receipt URLs in transaction document
  - [ ] Display receipt images in transaction details

- [ ] **Task 4.3.2:** Implement transaction tags
  - [ ] Add tags field to TransactionSchema
  - [ ] Create tag input component
  - [ ] Add tag filtering to transactions page
  - [ ] Display tags on transaction cards

- [ ] **Task 4.3.3:** Create transaction calendar view
  - [ ] Create `app/(dashboard)/transactions/calendar/page.tsx`
  - [ ] Display transactions on calendar
  - [ ] Show future recurring bills
  - [ ] Add date navigation
  - [ ] Click date to add transaction

---

## **Phase 5: Income Management & Tax Engine**

**Goal:** Implement net income calculation and multi-stream income tracking.

**Estimated Duration:** 1 Sprint

### **Milestone 5.1: Income Entry & Calculation**

- [ ] **Task 5.1.1:** Implement Simple Mode income entry
  - [ ] Direct Net Pay entry in transaction form
  - [ ] Pre-select INCOME type
  - [ ] Hide grossAmount and deductions fields

- [ ] **Task 5.1.2:** Implement Advanced Mode income entry
  - [ ] Add toggle for Simple/Advanced Mode
  - [ ] Show grossAmount and deductions fields
  - [ ] Auto-calculate Net Pay: `netAmount = grossAmount - deductions`
  - [ ] Display calculation breakdown
  - [ ] Save both gross and net amounts

- [ ] **Task 5.1.3:** Create income source categorization
  - [ ] Add income category types: Primary Salary, Side Hustle, Dividends, Gifts
  - [ ] Create income-specific categories
  - [ ] Filter transactions by income source

- [ ] **Task 5.1.4:** Create income summary widget
  - [ ] Create `components/widgets/IncomeSummary.tsx`
  - [ ] Display total income for current month
  - [ ] Break down by income source
  - [ ] Show gross vs net comparison (if Advanced Mode used)

### **Milestone 5.2: Recurring Income**

- [ ] **Task 5.2.1:** Create recurring rule management hooks
  - [ ] Create `lib/hooks/useRecurringRules.ts` with TanStack Query
  - [ ] Implement CRUD operations for recurring rules
  - [ ] Filter rules by type (INCOME, EXPENSE)

- [ ] **Task 5.2.2:** Create recurring rule form
  - [ ] Create `components/forms/RecurringRuleForm.tsx`
  - [ ] Form fields: name, amount, type, dayOfMonth, accountId, categoryId
  - [ ] Date picker for day of month selection
  - [ ] Use React Hook Form with Zod validation

- [ ] **Task 5.2.3:** Implement recurring income setup
  - [ ] Add "Set as Recurring" option in transaction form
  - [ ] Create recurring rule from transaction
  - [ ] Display recurring income rules in settings

---

## **Phase 6: Budgeting & Planning**

**Goal:** Implement allocation-based budgeting with 50/30/20 rule and category caps.

**Estimated Duration:** 2 Sprints

### **Milestone 6.1: Budget Templates**

- [ ] **Task 6.1.1:** Implement Zero-Based Budgeting
  - [ ] Create `lib/utils/budget.ts` utilities
  - [ ] Calculate: Income - Expenses = 0
  - [ ] Create budget allocation form
  - [ ] Display budget vs actual comparison

- [ ] **Task 6.1.2:** Implement 50/30/20 Rule
  - [ ] Create `lib/utils/fiftyThirtyTwenty.ts` calculator
  - [ ] Auto-calculate split: 50% Needs, 30% Wants, 20% Savings
  - [ ] Base calculation on logged Net Income
  - [ ] Create budget template selector
  - [ ] Apply template to categories

- [ ] **Task 6.1.3:** Create budget setup page
  - [ ] Create `app/(dashboard)/budget/page.tsx`
  - [ ] Display budget template selection
  - [ ] Show budget allocation breakdown
  - [ ] Allow manual adjustments
  - [ ] Save budget configuration

### **Milestone 6.2: Category Budget Caps**

- [ ] **Task 6.2.1:** Implement category budget limits
  - [ ] Add `monthlyBudgetCap` to CategorySchema (already in schema)
  - [ ] Create budget cap management UI
  - [ ] Set budget limits per category
  - [ ] Display budget caps in category management

- [ ] **Task 6.2.2:** Create budget progress bars
  - [ ] Create `components/widgets/BudgetProgressBar.tsx`
  - [ ] Calculate percentage: (spent / budget) \* 100
  - [ ] Color logic: Green (<75%), Yellow (75-90%), Red (>90%)
  - [ ] Display category name, budget amount, spent amount, percentage
  - [ ] Add tooltip with exact amounts
  - [ ] Implement segmented pill design per UI spec

- [ ] **Task 6.2.3:** Create budget tracker widget
  - [ ] Create `components/widgets/BudgetTracker.tsx`
  - [ ] Display segmented progress bar per UI spec
  - [ ] Show categories: Housing (Purple), Food (Orange), Fun (Pink)
  - [ ] Transform budget allocations into percentage segments
  - [ ] Display legend with category name, amount, percentage

### **Milestone 6.3: Budget Dashboard**

- [ ] **Task 6.3.1:** Create budget overview page
  - [ ] Display all categories with progress bars
  - [ ] Show total budget vs total spent
  - [ ] Show remaining budget
  - [ ] Add filter by category type (NEEDS, WANTS, SAVINGS)

- [ ] **Task 6.3.2:** Implement budget alerts
  - [ ] Create alert system for budget thresholds
  - [ ] Show warning when category exceeds 75%
  - [ ] Show critical alert when category exceeds 90%
  - [ ] Display alerts in dashboard

---

## **Phase 7: Savings & Goals**

**Goal:** Implement savings goal tracking and allocation.

**Estimated Duration:** 1 Sprint

### **Milestone 7.1: Savings Goals**

- [ ] **Task 7.1.1:** Create savings goal schema
  - [ ] Add SavingsGoal collection to Firestore schema
  - [ ] Fields: name, targetAmount, targetDate, currentAmount, accountId
  - [ ] Create Zod schema in `packages/validators`
  - [ ] Create TypeScript types

- [ ] **Task 7.1.2:** Create savings goal management hooks
  - [ ] Create `lib/hooks/useSavingsGoals.ts` with TanStack Query
  - [ ] Implement CRUD operations for savings goals
  - [ ] Calculate monthly savings requirement

- [ ] **Task 7.1.3:** Create savings goal form
  - [ ] Create `components/forms/SavingsGoalForm.tsx`
  - [ ] Form fields: name, targetAmount, targetDate, accountId
  - [ ] Calculate and display: "You need to save K500/month to reach this goal"
  - [ ] Use React Hook Form with Zod validation

- [ ] **Task 7.1.4:** Create savings goals page
  - [ ] Create `app/(dashboard)/goals/page.tsx`
  - [ ] Display list of savings goals
  - [ ] Show progress toward each goal
  - [ ] Display monthly savings requirement
  - [ ] Add create, edit, delete actions

### **Milestone 7.2: Savings Allocation**

- [ ] **Task 7.2.1:** Implement virtual savings transfer
  - [ ] Create "Transfer to Goal" functionality
  - [ ] Create transfer transaction (TRANSFER type)
  - [ ] Update goal currentAmount
  - [ ] Update account balance
  - [ ] Show transfer confirmation

- [ ] **Task 7.2.2:** Create savings goal widgets
  - [ ] Create `components/widgets/SavingsGoalCard.tsx`
  - [ ] Display goal name, target, current amount, progress percentage
  - [ ] Show time remaining and monthly requirement
  - [ ] Add progress visualization

---

## **Phase 8: Dashboard & Visualizations**

**Goal:** Create comprehensive dashboard with financial overview and charts.

**Estimated Duration:** 2 Sprints

### **Milestone 8.1: Dashboard Snapshot**

- [ ] **Task 8.1.1:** Create dashboard layout
  - [ ] Create `app/(dashboard)/layout.tsx` with sidebar
  - [ ] Create `components/layouts/AppSidebar.tsx`
  - [ ] Create `components/layouts/DashboardNavbar.tsx`
  - [ ] Implement responsive sidebar (collapsible on mobile)
  - [ ] Add navigation items: Dashboard, Transactions, Accounts, Budget, Goals, Settings

- [ ] **Task 8.1.2:** Create snapshot cards
  - [ ] Create `components/widgets/NetWorthCard.tsx`
    - [ ] Calculate: Assets - Debts (currently just assets)
    - [ ] Display total net worth
    - [ ] Show change from last month
  - [ ] Create `components/widgets/MonthToDateSpendingCard.tsx`
    - [ ] Calculate total expenses for current month
    - [ ] Compare to previous month
    - [ ] Show percentage change
  - [ ] Create `components/widgets/RemainingBudgetCard.tsx`
    - [ ] Calculate remaining budget for current month
    - [ ] Show percentage of budget used
    - [ ] Display warning if budget exceeded

- [ ] **Task 8.1.3:** Create dashboard home page
  - [ ] Create `app/(dashboard)/page.tsx`
  - [ ] Layout snapshot cards in grid
  - [ ] Add account cards section
  - [ ] Add recent transactions section
  - [ ] Make responsive for mobile

### **Milestone 8.2: Charts & Visualizations**

- [ ] **Task 8.2.1:** Implement Spending Wave chart
  - [ ] Create `components/widgets/SpendingWaveChart.tsx`
  - [ ] Use Recharts AreaChart component
  - [ ] Smooth spline curve (type="monotone")
  - [ ] Emerald Green stroke (#10B981, 2px width)
  - [ ] Gradient fill: Emerald-500 (opacity 0.2) to transparent
  - [ ] Horizontal grid lines (subtle)
  - [ ] Custom tooltip (floating white card)
  - [ ] Display last 6 months of spending data

- [ ] **Task 8.2.2:** Implement Expense Donut Chart
  - [ ] Create `components/widgets/ExpenseDonutChart.tsx`
  - [ ] Use Recharts PieChart component
  - [ ] Display expenses by category
  - [ ] Use category colors from database
  - [ ] Show percentages and amounts
  - [ ] Add legend

- [ ] **Task 8.2.3:** Implement Income vs Expense Line Graph
  - [ ] Create `components/widgets/IncomeExpenseChart.tsx`
  - [ ] Use Recharts LineChart component
  - [ ] Display income and expense trends
  - [ ] Show last 6 months
  - [ ] Use green for income, red for expenses
  - [ ] Add custom tooltip

- [ ] **Task 8.2.4:** Add charts to dashboard
  - [ ] Integrate Spending Wave chart
  - [ ] Integrate Expense Donut Chart
  - [ ] Integrate Income vs Expense Line Graph
  - [ ] Make charts responsive
  - [ ] Add loading states

### **Milestone 8.3: Recent Activity**

- [ ] **Task 8.3.1:** Create recent activity table
  - [ ] Create `components/widgets/RecentActivityTable.tsx`
  - [ ] Display last 10 transactions
  - [ ] Show category icon, description, amount, date
  - [ ] Color-code income (green) and expenses (red)
  - [ ] Add click to view transaction details
  - [ ] Make responsive for mobile

- [ ] **Task 8.3.2:** Add recent activity to dashboard
  - [ ] Integrate RecentActivityTable
  - [ ] Add "View All" link to transactions page
  - [ ] Add refresh functionality

---

## **Phase 9: Backend Services (Cloud Functions)**

**Goal:** Implement serverless backend logic for balance management and recurring transactions.

**Estimated Duration:** 1-2 Sprints

### **Milestone 9.1: Balance Keeper Function**

- [ ] **Task 9.1.1:** Implement Balance Keeper trigger
  - [ ] Create `functions/src/triggers/onTransactionWrite.ts`
  - [ ] Set up Firestore trigger: `onWrite` to `/users/{userId}/transactions/{txnId}`
  - [ ] Implement Create logic: Update account balance atomically
  - [ ] Implement Delete logic: Reverse account balance update
  - [ ] Implement Update logic: Handle account changes and amount changes
  - [ ] Add error handling and logging
  - [ ] Add transaction rollback on errors

- [ ] **Task 9.1.2:** Test Balance Keeper function
  - [ ] Set up Firebase Emulator
  - [ ] Test Create transaction scenario
  - [ ] Test Update transaction scenario (same account)
  - [ ] Test Update transaction scenario (different account)
  - [ ] Test Delete transaction scenario
  - [ ] Verify atomicity and data consistency
  - [ ] Test error scenarios

- [ ] **Task 9.1.3:** Deploy Balance Keeper function
  - [ ] Configure function deployment settings
  - [ ] Deploy to Firebase
  - [ ] Monitor function logs
  - [ ] Verify production behavior

### **Milestone 9.2: Recurring Engine Function**

- [ ] **Task 9.2.1:** Implement Recurring Engine scheduled function
  - [ ] Create `functions/src/scheduled/processRecurringRules.ts`
  - [ ] Set up Cloud Scheduler trigger (Daily at 00:00 UTC)
  - [ ] Query recurring_rules where `dayOfMonth == currentDay`
  - [ ] Filter by `lastRunDate != today`
  - [ ] Batch create Transaction documents
  - [ ] Update `lastRunDate` on rules
  - [ ] Add error handling and logging
  - [ ] Handle partial failures

- [ ] **Task 9.2.2:** Test Recurring Engine function
  - [ ] Test with Firebase Emulator
  - [ ] Create test recurring rules
  - [ ] Trigger function manually
  - [ ] Verify transactions are created
  - [ ] Verify lastRunDate is updated
  - [ ] Test duplicate prevention

- [ ] **Task 9.2.3:** Deploy Recurring Engine function
  - [ ] Configure Cloud Scheduler
  - [ ] Deploy to Firebase
  - [ ] Monitor function execution
  - [ ] Set up alerts for failures

---

## **Phase 10: Polish & Optimization**

**Goal:** Enhance UX, performance, and add finishing touches.

**Estimated Duration:** 1-2 Sprints

### **Milestone 10.1: Performance Optimization**

- [ ] **Task 10.1.1:** Optimize Firestore queries
  - [ ] Add pagination to transaction lists
  - [ ] Implement query limits
  - [ ] Add query result caching
  - [ ] Optimize composite queries
  - [ ] Verify dashboard load time < 1.5 seconds

- [ ] **Task 10.1.2:** Implement code splitting
  - [ ] Lazy load chart components
  - [ ] Lazy load form components
  - [ ] Optimize bundle size
  - [ ] Add loading skeletons

- [ ] **Task 10.1.3:** Optimize images and assets
  - [ ] Optimize receipt images
  - [ ] Implement image compression
  - [ ] Add lazy loading for images

### **Milestone 10.2: PWA Features**

- [ ] **Task 10.2.1:** Configure PWA manifest
  - [ ] Create `public/manifest.json`
  - [ ] Add app icons (various sizes)
  - [ ] Configure app name, description, theme colors
  - [ ] Set display mode (standalone)

- [ ] **Task 10.2.2:** Implement service worker
  - [ ] Set up offline caching strategy
  - [ ] Cache static assets
  - [ ] Cache API responses
  - [ ] Handle offline mode

- [ ] **Task 10.2.3:** Add install prompt
  - [ ] Implement "Add to Home Screen" prompt
  - [ ] Add install button in UI
  - [ ] Handle PWA installation

### **Milestone 10.3: UX Enhancements**

- [ ] **Task 10.3.1:** Implement dark mode
  - [ ] Verify next-themes integration
  - [ ] Test dark mode across all components
  - [ ] Add theme toggle in settings
  - [ ] Ensure charts are readable in dark mode

- [ ] **Task 10.3.2:** Add keyboard shortcuts
  - [ ] Implement shortcut for quick add expense
  - [ ] Add navigation shortcuts
  - [ ] Display shortcut hints

- [ ] **Task 10.3.3:** Improve mobile experience
  - [ ] Optimize touch targets
  - [ ] Add swipe gestures
  - [ ] Improve mobile navigation
  - [ ] Test on various devices

- [ ] **Task 10.3.4:** Add loading and error states
  - [ ] Implement skeleton screens
  - [ ] Add error boundaries
  - [ ] Improve error messages
  - [ ] Add retry functionality

### **Milestone 10.4: Data Export**

- [ ] **Task 10.4.1:** Implement CSV export
  - [ ] Create export utility function
  - [ ] Export transactions to CSV
  - [ ] Export accounts to CSV
  - [ ] Add export button in settings

- [ ] **Task 10.4.2:** Implement PDF export
  - [ ] Install PDF generation library
  - [ ] Create PDF report template
  - [ ] Generate monthly financial report
  - [ ] Add export button

---

## **Phase 11: Testing & Quality Assurance**

**Goal:** Comprehensive testing and bug fixes.

**Estimated Duration:** 1-2 Sprints

### **Milestone 11.1: Unit Testing**

- [ ] **Task 11.1.1:** Set up Vitest
  - [ ] Configure Vitest in workspace
  - [ ] Set up test utilities
  - [ ] Create test helpers

- [ ] **Task 11.1.2:** Write utility function tests
  - [ ] Test currency formatters
  - [ ] Test date formatters
  - [ ] Test net pay calculators
  - [ ] Test budget calculations
  - [ ] Test 50/30/20 calculator

- [ ] **Task 11.1.3:** Write component tests
  - [ ] Test UI components in `packages/ui`
  - [ ] Test form components
  - [ ] Test widget components
  - [ ] Achieve >80% code coverage

### **Milestone 11.2: End-to-End Testing**

- [ ] **Task 11.2.1:** Set up Playwright
  - [ ] Configure Playwright in workspace
  - [ ] Set up test environment
  - [ ] Configure Firebase Emulator integration

- [ ] **Task 11.2.2:** Write critical path tests
  - [ ] **Critical Path 1:** User Login → Dashboard Load
  - [ ] **Critical Path 2:** Create Transaction → Verify Balance Update
  - [ ] **Critical Path 3:** Create Budget → Verify Progress Bar Update
  - [ ] **Critical Path 4:** Create Account → Verify Display
  - [ ] **Critical Path 5:** Onboarding Flow → Verify Completion

- [ ] **Task 11.2.3:** Write integration tests
  - [ ] Test transaction CRUD flow
  - [ ] Test account CRUD flow
  - [ ] Test budget setup flow
  - [ ] Test recurring rule creation

### **Milestone 11.3: Bug Fixes & Refinement**

- [ ] **Task 11.3.1:** Conduct comprehensive testing
  - [ ] Test all user flows
  - [ ] Test edge cases
  - [ ] Test error scenarios
  - [ ] Test on multiple browsers
  - [ ] Test on mobile devices

- [ ] **Task 11.3.2:** Fix identified bugs
  - [ ] Prioritize critical bugs
  - [ ] Fix high-priority bugs
  - [ ] Fix medium-priority bugs
  - [ ] Document bug fixes

- [ ] **Task 11.3.3:** Performance testing
  - [ ] Test dashboard load time
  - [ ] Test transaction list performance
  - [ ] Test chart rendering performance
  - [ ] Optimize slow operations

---

## **Phase 12: Deployment & Launch Preparation**

**Goal:** Prepare for production deployment and launch.

**Estimated Duration:** 1 Sprint

### **Milestone 12.1: Production Configuration**

- [ ] **Task 12.1.1:** Configure production environment
  - [ ] Set up production Firebase project
  - [ ] Configure production environment variables
  - [ ] Set up production Vercel deployment
  - [ ] Configure custom domain

- [ ] **Task 12.1.2:** Set up monitoring and analytics
  - [ ] Configure Firebase Analytics
  - [ ] Set up error tracking (Sentry or similar)
  - [ ] Configure performance monitoring
  - [ ] Set up uptime monitoring

- [ ] **Task 12.1.3:** Security audit
  - [ ] Review Firestore security rules
  - [ ] Review authentication implementation
  - [ ] Review environment variable security
  - [ ] Conduct security testing

### **Milestone 12.2: Documentation**

- [ ] **Task 12.2.1:** Create user documentation
  - [ ] Write user guide
  - [ ] Create onboarding tutorial
  - [ ] Add help tooltips in app
  - [ ] Create FAQ section

- [ ] **Task 12.2.2:** Create developer documentation
  - [ ] Update README.md
  - [ ] Document API structure
  - [ ] Document deployment process
  - [ ] Create contributing guidelines

### **Milestone 12.3: Launch**

- [ ] **Task 12.3.1:** Pre-launch checklist
  - [ ] Verify all features work in production
  - [ ] Test production deployment
  - [ ] Verify analytics tracking
  - [ ] Test error handling

- [ ] **Task 12.3.2:** Soft launch
  - [ ] Deploy to production
  - [ ] Test with beta users
  - [ ] Collect feedback
  - [ ] Fix critical issues

- [ ] **Task 12.3.3:** Public launch
  - [ ] Announce launch
  - [ ] Monitor system performance
  - [ ] Respond to user feedback
  - [ ] Plan post-launch improvements

---

## **Future Phases (Post-MVP)**

### **Phase 13: Multi-Currency Support**

- Multi-currency account support
- Auto-conversion rates
- Currency exchange tracking

### **Phase 14: SMS Parsing (Android)**

- SMS transaction parsing
- Auto-log bank transactions
- Transaction categorization AI

### **Phase 15: Collaborative Budgeting**

- Shared budgets for couples
- Joint account management
- Expense sharing

---

## **Notes**

- This roadmap is a living document and will be updated as development progresses
- Task estimates are approximate and may vary based on complexity
- Priorities may shift based on user feedback and business needs
- Each sprint should focus on completing at least one milestone
- Regular reviews and retrospectives should be conducted after each sprint

---

**Last Updated:** December 2025  
**Next Review:** After Phase 2 completion

---

## **Progress Summary**

### **Phase 1: Foundation & Project Setup** - ✅ Completed

**Completed:**

- ✅ Milestone 1.1: Core Dependencies & Package Setup (100%)
- ✅ Milestone 1.2: Firebase Infrastructure Refactoring (100%)
- 🚧 Milestone 1.3: UI Foundation & Utilities (33% - utilities.ts created, format.ts and calculations.ts pending)

**Remaining Tasks:**

- Task 1.1.6: Standardize TypeScript versions across all packages
- Task 1.2.2: Test and deploy Firestore Security Rules
- Task 1.2.3: Deploy Firestore Indexes
- Task 1.3.1: Complete utility functions (format.ts, calculations.ts)
- Task 1.3.2: Set up shadcn/ui components
- Task 1.3.3: Create base UI components

### **Phase 2: Authentication & User Management** - ✅ Completed

**Completed:**

- ✅ Milestone 2.1: Authentication Infrastructure (100%)
- ✅ Milestone 2.2: User Profile & Onboarding (100%)

**Key Achievements:**

- ✅ Full authentication flow with email/password (Google OAuth removed per user request)
- ✅ Clean, light-themed split-screen login/signup pages matching design reference
- ✅ Centered onboarding layout (gradient removed for onboarding screens)
- ✅ Multi-step onboarding wizard (Currency → Fiscal Profile → Review)
- ✅ User profile management with Firestore integration
- ✅ Protected routes with light, glass-styled dashboard layout
- ✅ Settings page for profile editing
- ✅ Shared UI Checkbox component integrated in login page
- ✅ Type-safe error handling (replaced `any` with `unknown`)
- ✅ Zod v3 alignment across workspace for form validation

**Deferred Items:**

- ⏸️ Email verification page (deferred - not critical for MVP)
- ⏸️ Onboarding Step 3: Initial Balance Setup (deferred to Phase 3)
- ⏸️ Account deletion functionality (deferred to post-MVP)
- ⏸️ Reusable profile form component (current implementation sufficient for MVP)

**Next Steps:**

- ✅ Phase 3: Accounts & Asset Management (In Progress)

### **Phase 3: Accounts & Asset Management** - 🚧 In Progress

**Completed:**

- ✅ Task 3.1.1: Created account management hooks (`useAccounts`, `useAccount`, `useCreateAccount`, `useUpdateAccount`, `useArchiveAccount`, `useDeleteAccount`)
- ✅ Task 3.1.2: Created AccountForm component with validation (supports create/edit modes)
- ✅ Task 3.1.3: Created accounts page with list view, CRUD actions, and empty state
- ✅ Task 3.2.1: Created AccountCard widget for reusable account display
- ✅ Task 3.2.2: Created net worth calculation utilities (`calculateNetWorth`, `calculateBalanceByType`, `getAccountDistribution`)

**Key Features Implemented:**

- ✅ Account CRUD operations with Firestore integration
- ✅ TanStack Query integration for data fetching and caching
- ✅ Account types: Cash, Bank, Mobile Money, Savings
- ✅ Glass-themed UI with light mode design
- ✅ Total balance aggregation across accounts
- ✅ Account archiving (soft delete) support
- ✅ Form validation with Zod schemas
- ✅ Optimistic updates and cache invalidation

**Remaining Tasks:**

- ⏳ Task 3.1.4: Implement manual balance reconciliation (deferred - requires transaction system)

**Next Steps:**

- Begin Phase 4: Transaction Management
