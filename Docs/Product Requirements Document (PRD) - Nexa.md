# **Product Requirements Document (PRD): Nexa**

**Version:** 1.0

**Status:** Draft

**Date:** October 26, 2023

## **1\. Executive Summary**

The Personal Finance Tracker is a web-based application designed to help individuals—specifically salaried employees with side incomes—manage their financial health. Unlike generic trackers, this app emphasizes "Net Pay" calculation, multi-stream income management, and allocation-based budgeting (e.g., 50/30/20 rule).

**Core Value Proposition:** accurate net-income tracking combined with budget allocation to give users a "True Disposable Income" view.

## **2\. Target Audience**

* **Primary:** Salaried professionals with single or multiple income streams.  
* **Secondary:** Freelancers needing tax estimation help.  
* **Geographic Focus:** Global architecture, with initial default localization for Zambia (ZMW, Date formats).

## **3\. Functional Requirements (Epics)**

### **Epic 1: Authentication & Onboarding**

**Goal:** Secure entry and personalized setup to reduce initial friction.

* **FR 1.1: Sign Up/Login**  
  * Email/Password authentication.  
  * Google OAuth integration (Recommended for lower friction).  
  * Email verification requirement before full access.  
* **FR 1.2: The "Smart" Onboarding Wizard**  
  * **Currency Selection:** Default ZMW (Kwacha), USD, GBP, ZAR.  
  * **Fiscal Profile:** User selects "Salaried" or "Freelance" (adjusts UI terminology).  
  * **Initial Balance:** User sets current cash/bank balance to start tracking immediately.

### **Epic 2: Accounts & Asset Management (New\*)**

**Goal:** Track *where* the money is, not just *how* it moves.

* **FR 2.1: Account Types**  
  * Pre-defined types: Cash, Bank Account, Mobile Money, Savings.  
* **FR 2.2: Manual Reconciliation**  
  * User can manually update the balance of an account if they forgot to log a transaction (e.g., "Adjust Balance" feature).

### **Epic 3: Income Management & Tax Engine**

**Goal:** Accurate calculation of disposable income.

* **FR 3.1: Gross vs. Net Entry**  
  * **Simple Mode:** User enters Net Pay directly.  
  * **Advanced Mode:** User enters Gross Pay \+ Deductions (Tax, Social Security, Insurance). App calculates Net.  
* **FR 3.2: Recurring Income**  
  * User can flag a salary as "Recurring Monthly." The app auto-creates this transaction on the 25th (or selected date) of every month.  
* **FR 3.3: Multiple Streams**  
  * Ability to categorize income sources: Primary Salary, Side Hustle, Dividends, Gifts.

### **Epic 4: Expense Tracking**

**Goal:** High-speed logging and categorization.

* **FR 4.1: Quick Add Expense**  
  * Required fields: Amount, Category, Account (paid from), Date.  
  * Optional: Note, Receipt Image, Tags (e.g., \#Vacation).  
* **FR 4.2: Categories Management**  
  * System defaults (Transport, Food, Rent).  
  * Custom category creation (color-coded).  
* **FR 4.3: Recurring Expenses**  
  * Set recurring bills (Rent, Netflix, Gym). These auto-deduct from the projected balance.

### **Epic 5: Budgeting & Planning (The "Allocator")**

**Goal:** Proactive financial planning using the 50/30/20 rule.

* **FR 5.1: Budget Templates**  
  * **Zero-Based Budgeting:** Income \- Expenses \= 0\.  
  * **50/30/20 Rule:** Auto-calculates split based on logged Net Income.  
* **FR 5.2: Category Caps**  
  * Set a hard limit (e.g., K2,000 for Groceries).  
  * Visual "Health Bar" for each category: Green (\<50%), Yellow (75%), Red (\>90%).

### **Epic 6: Savings & Goals**

**Goal:** Gamify the saving process.

* **FR 6.1: Goal Creation**  
  * Name, Target Amount, Target Date.  
  * Algorithm: "You need to save K500/month to reach this goal."  
* **FR 6.2: Savings Allocation**  
  * "Transfer" money from a Spend Account to a Savings Goal (virtually segregating the money).

### **Epic 7: Dashboard & Reporting**

**Goal:** Instant financial situational awareness.

* **FR 7.1: The "Snapshot"**  
  * Top Cards: Total Net Worth (Assets \- Debts), Month-to-Date Spending, Remaining Budget.  
* **FR 7.2: Visualizations**  
  * Donut Chart: Expenses by Category.  
  * Line Graph: Income vs. Expense trend over last 6 months.  
* **FR 7.3: Calendar View**  
  * View past transactions and *future* recurring bills on a calendar interface.

## **4\. Non-Functional Requirements**

* **Performance:** Dashboard load time \< 1.5 seconds.  
* **Security:** Data encryption at rest (AES-256) and in transit (TLS 1.3). No storage of raw credit card numbers.  
* **Mobile Responsiveness:** The web app must function indistinguishably from a native app on mobile browsers (PWA strict compliance).  
* **Data Integrity:** Daily database backups. Export to CSV/PDF feature for users.

## **5\. UI/UX Guidelines**

* **Theme:** Clean, "Trust" evoking colors (Blues, Greens, Whites). Dark mode support.  
* **Interaction:** "Three-click rule"—user should be able to log an expense in 3 clicks or fewer.  
* **Mobile First:** Buttons and inputs sized for thumb interaction.

## **6\. Future Roadmap (Post-MVP)**

* **Phase 2:** Multi-currency support (auto-conversion rates).  
* **Phase 3:** SMS Parsing (Android only) to auto-log bank transactions.  
* **Phase 4:** Collaborative Budgeting (Couples/Joint Accounts).