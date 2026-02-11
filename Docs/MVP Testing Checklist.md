# Nexa Finance Platform - Comprehensive Testing Checklist

## MVP Readiness Testing Guide

**Version:** 1.0  
**Date:** January 4, 2026  
**Status:** Ready for Pre-Launch Testing

---

## Testing Overview

This document provides a systematic approach to testing all features implemented in Nexa before public user testing. Complete each section sequentially, documenting any issues found.

**Testing Principles:**

- ✅ Test happy paths (expected user behavior)
- ⚠️ Test edge cases (boundary conditions)
- ❌ Test error scenarios (invalid inputs, failures)
- 🔄 Test data persistence and real-time updates
- 🎨 Test UI/UX consistency and responsiveness

---

## 1. Authentication & Onboarding

### 1.1 User Registration

- [ ] Navigate to sign-up page
- [ ] Enter valid email and password
- [ ] Verify email validation works
- [ ] Verify password strength requirements
- [ ] Successfully create account
- [ ] **Edge Case:** Try registering with existing email (should show error)
- [ ] **Edge Case:** Try weak password (should be rejected)

### 1.2 User Login

- [ ] Enter correct credentials
- [ ] Successfully login and redirect to dashboard
- [ ] Verify user session persists on page refresh
- [ ] **Error Test:** Try incorrect password (should show error)
- [ ] **Error Test:** Try non-existent email (should show error)

### 1.3 Onboarding Flow

- [ ] Complete onboarding wizard after first login
- [ ] Set default currency (K for Kwacha)
- [ ] Set fiscal year type (Calendar/Fiscal)
- [ ] Verify onboarding data is saved
- [ ] Verify redirect to dashboard after completion
- [ ] **Edge Case:** Try skipping onboarding (should not be allowed if required)

---

## 2. Account Management

### 2.1 Create Accounts

- [ ] Navigate to Accounts page
- [ ] Create a **BANK** account (e.g., "Standard Bank Checking")
- [ ] Create a **CASH** account (e.g., "Wallet")
- [ ] Create a **MOBILE_MONEY** account (e.g., "Airtel Money")
- [ ] Create a **SAVINGS** account (e.g., "Emergency Fund")
- [ ] Verify all accounts appear in the list
- [ ] Verify initial balance is K0.00

### 2.2 Edit Accounts

- [ ] Edit account name
- [ ] Edit account type
- [ ] Save changes and verify persistence
- [ ] **UI Test:** Verify changes appear immediately in UI

### 2.3 Archive Accounts

- [ ] Archive an account
- [ ] Verify it's hidden from active accounts list
- [ ] Verify archived accounts can still be viewed
- [ ] **Edge Case:** Try archiving account with active transactions

### 2.4 Delete Accounts

- [ ] Delete an empty account
- [ ] Verify it's removed from the list
- [ ] **Error Test:** Try deleting account with transactions (should warn or prevent)

---

## 3. Category Management

### 3.1 Default Categories

- [ ] Verify default categories are created on first launch
- [ ] Check categories for NEEDS, WANTS, and SAVINGS types
- [ ] Verify each category has a color and icon

### 3.2 Create Custom Categories

- [ ] Create a **NEEDS** category (e.g., "Utilities")
- [ ] Create a **WANTS** category (e.g., "Coffee Shops")
- [ ] Create a **SAVINGS** category (e.g., "Vacation Fund")
- [ ] Assign colors to each category
- [ ] Assign icons to each category
- [ ] **UI Test:** Verify color picker works correctly

### 3.3 Set Budget Caps

- [ ] Set monthlyBudgetCap for 3-5 categories
- [ ] Use realistic amounts (e.g., K500 for Groceries)
- [ ] Save and verify budgets appear in Budget page

### 3.4 Edit Categories

- [ ] Change category name
- [ ] Change category color
- [ ] Change budget cap amount
- [ ] Verify changes persist and update everywhere

---

## 4. Transaction Management

### 4.1 Create Income Transaction

- [ ] Navigate to Transactions page
- [ ] Click "Add Transaction" or "+" button
- [ ] Select type: **INCOME**
- [ ] Enter amount (e.g., K5000)
- [ ] Select an account
- [ ] Select/create income category (e.g., "Salary")
- [ ] Set date to today
- [ ] Add optional description
- [ ] Save transaction
- [ ] **Critical:** Verify account balance INCREASES by the income amount
- [ ] **UI Test:** Verify transaction appears in Recent Activity

### 4.2 Create Expense Transaction

- [ ] Create **EXPENSE** transaction
- [ ] Enter amount (e.g., K150)
- [ ] Select an account
- [ ] Select expense category (e.g., "Groceries")
- [ ] Set date
- [ ] Add description
- [ ] Save transaction
- [ ] **Critical:** Verify account balance DECREASES by the expense amount
- [ ] Verify transaction appears in list

### 4.3 Create Transfer Transaction

- [ ] Create **TRANSFER** transaction
- [ ] Enter amount (e.g., K200)
- [ ] Select **source account** (fromAccount)
- [ ] Select **destination account** (toAccount)
- [ ] Set date
- [ ] Save transaction
- [ ] **Critical:** Verify source account balance DECREASES by K200
- [ ] **Critical:** Verify destination account balance INCREASES by K200
- [ ] **Critical:** Verify both account balances are updated atomically

### 4.4 Edit Transactions

- [ ] Edit an existing income transaction
  - [ ] Change amount
  - [ ] **Critical:** Verify old amount is reversed and new amount is applied
- [ ] Edit an existing expense transaction
  - [ ] Change category
  - [ ] Verify category update shows in UI
- [ ] Edit a transfer transaction
  - [ ] Change amount
  - [ ] **Critical:** Verify both accounts are updated correctly
  - [ ] Change destination account
  - [ ] **Critical:** Verify balances are updated for all 3 accounts (old source, new source, old dest, new dest)

### 4.5 Delete Transactions

- [ ] Delete an income transaction
- [ ] **Critical:** Verify account balance DECREASES (reverses the income)
- [ ] Delete an expense transaction
- [ ] **Critical:** Verify account balance INCREASES (reverses the expense)
- [ ] Delete a transfer transaction
- [ ] **Critical:** Verify both accounts are restored to pre-transfer balances

### 4.6 Transaction Filtering & Search

- [ ] Use search bar to find transactions by description
- [ ] Filter by transaction type (All, Income, Expense, Transfer)
- [ ] Filter by category
- [ ] Filter by account
- [ ] Filter by date range
- [ ] Verify correct transactions are displayed

### 4.7 Bulk Operations

- [ ] Select multiple transactions
- [ ] Bulk delete several transactions
- [ ] **Critical:** Verify all account balances are updated correctly

---

## 5. Budget Tracking

### 5.1 Budget Dashboard

- [ ] Navigate to Budget page
- [ ] Verify total monthly budgets are displayed
- [ ] Verify total spending is calculated correctly

### 5.2 Category Budget Progress

- [ ] For each category with a budget:
  - [ ] Verify progress bar shows correct percentage
  - [ ] Verify spent/budgeted amounts are accurate
  - [ ] Create expenses in that category
  - [ ] **Real-time Test:** Verify budget updates immediately after expense is added

### 5.3 Budget Alerts

- [ ] Spend 80% of a category budget
- [ ] Verify warning indicator appears (if implemented)
- [ ] Spend 100% of a category budget
- [ ] Verify over-budget indicator appears

### 5.4 50/30/20 Rule Display

- [ ] Verify 50/30/20 split is calculated based on total income
- [ ] Verify spending is categorized correctly:
  - [ ] NEEDS categories count toward 50%
  - [ ] WANTS categories count toward 30%
  - [ ] SAVINGS categories count toward 20%

### 5.5 Budget Filtering

- [ ] Use tab switches to filter by category type
  - [ ] All
  - [ ] Needs
  - [ ] Wants
  - [ ] Savings
- [ ] Verify only relevant categories are displayed

---

## 6. Savings Goals

### 6.1 Create Savings Goal

- [ ] Navigate to Goals page
- [ ] Click "Add Goal"
- [ ] Enter goal name (e.g., "New Car")
- [ ] Set target amount (e.g., K200,000)
- [ ] Set target date (future date)
- [ ] Select color
- [ ] Add optional description
- [ ] Save goal
- [ ] Verify goal appears in goals list

### 6.2 Goal Calculations

- [ ] Verify "Time Left" shows correct months/days remaining
- [ ] Verify "Per Month" shows required monthly contribution
  - **Formula:** (Target - Current) / Months Remaining
- [ ] Verify progress bar shows 0% initially

### 6.3 Contribute to Goal

- [ ] Click "Contribute to Goal"
- [ ] Enter contribution amount
- [ ] Select source account
- [ ] Submit contribution
- [ ] **Critical:** Verify goal currentAmount increases
- [ ] **Critical:** Verify source account balance decreases
- [ ] Verify progress bar updates
- [ ] Verify "Per Month" recalculates

### 6.4 Goal Completion

- [ ] Continue contributing until currentAmount >= targetAmount
- [ ] Verify goal shows "Achieved" status
- [ ] Verify "Per Month" shows K0.00 when achieved
- [ ] Verify appropriate UI indication (badge, color, etc.)

### 6.5 Edit & Delete Goals

- [ ] Edit goal target amount
- [ ] Edit goal target date
- [ ] Verify "Per Month" recalculates
- [ ] Delete a goal
- [ ] Verify it's removed from list

---

## 7. Dashboard & Visualizations

### 7.1 Total Balance Card

- [ ] Verify total balance = sum of all active account balances
- [ ] Verify account breakdown shows percentages
- [ ] Create a transaction and verify balance updates in real-time
- [ ] Verify month-over-month change indicator (if you have data from previous month)

### 7.2 Budget Tracker Widget

- [ ] Verify segmented progress bar shows correct proportions
- [ ] Verify total budget/spent displays accurately
- [ ] Toggle between "Totals" and "Percent" views
- [ ] **UI Test:** Verify pill-style tabs have cursor pointer

### 7.3 Spending Chart

- [ ] Verify chart displays cumulative spending for current month
- [ ] Switch time range: 7 days, 30 days, 90 days
- [ ] Verify chart updates with selected range
- [ ] Verify chart uses blue theme color
- [ ] Add an expense and verify chart updates

### 7.4 Expense Donut Chart

- [ ] Verify donut chart shows expense breakdown by category
- [ ] Hover over segments to see tooltips
- [ ] Verify percentages are displayed correctly
- [ ] Verify chart is not cut off at the top
- [ ] Click on segments - verify no blue box highlight appears

### 7.5 Income vs Expenses Chart

- [ ] Verify bar chart shows last 12 months
- [ ] Verify green bars for income, red bars for expenses
- [ ] Hover over bars to see detailed tooltip
- [ ] Verify Net Savings and Savings Rate are calculated correctly
- [ ] Create income/expense transactions and verify chart updates

### 7.6 Recent Activity Widget

- [ ] Verify recent transactions are displayed
- [ ] Verify transaction type icons are correct
- [ ] Use search to filter transactions
- [ ] Click "View All" and verify navigation to Transactions page

---

## 8. Recurring Transactions

### 8.1 Create Recurring Rule

- [ ] Navigate to Recurring Rules page (if available)
- [ ] Create a recurring income rule (e.g., "Monthly Salary" on day 25)
- [ ] Create a recurring expense rule (e.g., "Rent" on day 1)
- [ ] Set amount, account, category
- [ ] Save rules

### 8.2 Test Recurring Engine

- [ ] **Manual Trigger:** If possible, manually trigger the recurring function
- [ ] **Wait Method:** Create rule for tomorrow's date and wait
- [ ] Verify transactions are auto-created on the specified day
- [ ] Verify account balances update automatically
- [ ] Verify `lastRunDate` is updated after execution
- [ ] **Duplicate Prevention:** Trigger twice - verify no duplicates are created

---

## 9. Cloud Functions Testing

### 9.1 Balance Keeper Function

#### Test CREATE

- [ ] Create income transaction
- [ ] **Monitor:** Check Firebase Functions logs
- [ ] Verify function executed successfully
- [ ] Verify account balance increased

#### Test UPDATE (Same Account)

- [ ] Update transaction amount
- [ ] **Critical:** Verify old amount is reversed
- [ ] **Critical:** Verify new amount is applied
- [ ] Check logs for successful execution

#### Test UPDATE (Different Account - Transfer)

- [ ] Update transfer to use different destination account
- [ ] **Critical:** Verify 3 account updates:
  - Original source: no change
  - Original destination: reversed
  - New destination: credited

#### Test DELETE

- [ ] Delete transaction
- [ ] **Critical:** Verify balance is reversed correctly
- [ ] Check logs for successful execution

#### Test TRANSFER

- [ ] Create transfer K100 from Account A to Account B
- [ ] **Critical:** Verify Account A decreases by K100
- [ ] **Critical:** Verify Account B increases by K100
- [ ] Delete transfer
- [ ] **Critical:** Verify both accounts are restored

#### Error Scenarios

- [ ] Monitor logs for any errors or warnings
- [ ] Verify no transactions fail silently

### 9.2 Recurring Engine Function

- [ ] Check Firebase Cloud Scheduler is enabled
- [ ] Verify function runs daily at 00:00 UTC
- [ ] Monitor execution logs
- [ ] Verify successful creation of recurring transactions

---

## 10. UI/UX Testing

### 10.1 Navigation

- [ ] Verify all sidebar links work correctly
- [ ] Verify active page is highlighted in sidebar
- [ ] Test navigation between all pages
- [ ] Verify breadcrumbs (if implemented)

### 10.2 Responsiveness

- [ ] Test on desktop (1920x1080, 1366x768)
- [ ] Test on tablet (768x1024)
- [ ] Test on mobile (375x667, 414x896)
- [ ] Verify layouts adapt correctly
- [ ] Verify no horizontal scrolling
- [ ] Verify touch targets are adequate on mobile

### 10.3 Button & Interaction States

- [ ] **Cursor:** Verify all clickable elements show pointer cursor
  - [ ] Buttons
  - [ ] Tabs
  - [ ] Links
  - [ ] Cards (if clickable)
- [ ] Verify hover states on buttons
- [ ] Verify active states on buttons
- [ ] Verify disabled states are clear

### 10.4 Forms & Validation

- [ ] Submit empty required fields - verify validation errors
- [ ] Enter invalid data (negative amounts, future dates for old transactions)
- [ ] Verify error messages are clear and helpful
- [ ] Verify success messages appear after saving

### 10.5 Loading States

- [ ] Verify skeleton loaders appear while data is loading
- [ ] Verify spinners on button clicks
- [ ] Test with slow network connection (throttle to 3G)

### 10.6 Color Consistency

- [ ] Verify blue theme (#2563EB / blue-600) is used consistently:
  - [ ] Primary buttons
  - [ ] Active tab switches
  - [ ] Chart colors (Spending Chart)
  - [ ] Links
- [ ] Verify color contrast meets accessibility standards

### 10.7 Tab Switch Styling

- [ ] Dashboard Budget Tracker tabs (Totals/Percent)
  - [ ] Verify gray background wrapper
  - [ ] Verify blue active state
  - [ ] Verify cursor pointer
- [ ] Budget page tabs (All/Needs/Wants/Savings)
  - [ ] Verify gray background wrapper
  - [ ] Verify blue active state
  - [ ] Verify cursor pointer
- [ ] Transactions page tabs (All/Income/Expense/Transfer)
  - [ ] Verify consistent styling with above

---

## 11. Data Persistence & Real-Time Updates

### 11.1 Firestore Real-Time Sync

- [ ] Open app in two browser tabs/windows
- [ ] Create transaction in Tab 1
- [ ] **Real-time Test:** Verify it appears immediately in Tab 2
- [ ] Update transaction in Tab 2
- [ ] Verify changes appear in Tab 1
- [ ] Delete transaction in Tab 1
- [ ] Verify it disappears in Tab 2

### 11.2 Offline Behavior

- [ ] Disconnect internet
- [ ] Try to load page - verify appropriate error handling
- [ ] (If offline support implemented) Verify cached data is shown

### 11.3 Data Accuracy

- [ ] Calculate totals manually for verification:
  - [ ] Total balance = sum of all accounts
  - [ ] Total income = sum of income transactions
  - [ ] Total expenses = sum of expense transactions
  - [ ] Budget spent = sum of expenses in category
- [ ] Verify calculations match your manual calculations

---

## 12. Edge Cases & Error Handling

### 12.1 Boundary Values

- [ ] Create transaction with amount K0.00
- [ ] Create transaction with very large amount (K999,999,999)
- [ ] Create transaction with many decimal places (K123.456789)
- [ ] Set budget to K0
- [ ] Set savings goal with target date in the past

### 12.2 Data Integrity

- [ ] Create 100+ transactions
- [ ] Verify app performance remains acceptable
- [ ] Verify pagination works (if implemented)
- [ ] Delete multiple transactions at once
- [ ] Verify no orphaned data remains

### 12.3 Error Messages

- [ ] Verify user-friendly error messages appear for:
  - [ ] Network errors
  - [ ] Permission errors
  - [ ] Validation errors
  - [ ] Server errors

---

## 13. Security & Authentication

### 13.1 Route Protection

- [ ] Sign out
- [ ] Try accessing protected routes (e.g., /dashboard)
- [ ] Verify redirect to login page
- [ ] Verify authenticated routes are inaccessible when logged out

### 13.2 Data Isolation

- [ ] Create data with User A
- [ ] Sign out and sign in as User B
- [ ] Verify User B cannot see User A's data
- [ ] Verify each user has isolated data

### 13.3 Session Management

- [ ] Verify session expires after reasonable time (if implemented)
- [ ] Test "Remember Me" functionality (if implemented)

---

## 14. Performance Testing

### 14.1 Page Load Times

- [ ] Measure initial dashboard load time
  - Target: < 2 seconds on good connection
- [ ] Measure transaction list load time
- [ ] Measure chart rendering time

### 14.2 Cloud Function Performance

- [ ] Monitor function execution time in Firebase Console
  - Balance Keeper should execute < 1 second
  - Recurring Engine should complete within reasonable time

### 14.3 Database Queries

- [ ] Monitor Firestore usage in Firebase Console
- [ ] Verify no excessive reads/writes
- [ ] Check for any queries that need optimization

---

## 15. Accessibility (Basic)

### 15.1 Keyboard Navigation

- [ ] Tab through all interactive elements
- [ ] Verify focus indicators are visible
- [ ] Verify all actions can be completed with keyboard

### 15.2 Screen Reader (Optional)

- [ ] Test with screen reader if available
- [ ] Verify alt text on images
- [ ] Verify semantic HTML structure

---

## Testing Checklist Summary

After completing all tests above, verify:

### Critical Functionality ✅

- [ ] Users can register and log in
- [ ] Users can create accounts
- [ ] Users can create transactions
- [ ] Account balances update automatically (Balance Keeper works)
- [ ] Transfers work correctly (both accounts update)
- [ ] Budget tracking works
- [ ] Savings goals work
- [ ] Dashboard displays all widgets correctly
- [ ] Recurring transactions are created automatically

### Data Integrity ✅

- [ ] No data loss occurs during any operation
- [ ] Account balances are always accurate
- [ ] Transactions and balances are in sync
- [ ] No duplicate transactions from recurring engine

### User Experience ✅

- [ ] UI is responsive and works on mobile
- [ ] All buttons and links work as expected
- [ ] Loading states provide feedback
- [ ] Error messages are clear and helpful
- [ ] Colors and styling are consistent

### Performance ✅

- [ ] App loads reasonably quickly
- [ ] Cloud Functions execute promptly
- [ ] Real-time updates work smoothly
- [ ] No major lag or freezing

---

## Bug Tracking Template

When you find issues, document them as follows:

```
**Bug ID:** [Unique identifier]
**Severity:** Critical / High / Medium / Low
**Component:** [e.g., Transactions, Balance Keeper, Budget Tracker]
**Description:** [Detailed description of the issue]
**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]
**Expected Behavior:** [What should happen]
**Actual Behavior:** [What actually happens]
**Screenshots:** [If applicable]
**Priority:** [Must fix before launch / Can fix post-launch]
```

---

## Post-Testing Actions

After completing this comprehensive test:

1. **Document all bugs** found during testing
2. **Prioritize fixes:** Critical → High → Medium → Low
3. **Fix critical bugs** that prevent core functionality
4. **Retest** all areas where bugs were fixed
5. **Performance optimization** if needed
6. **Prepare for user testing** once stable

---

## Notes

- This testing should take approximately **4-6 hours** to complete thoroughly
- Don't rush - methodical testing prevents issues in production
- Test in a **clean browser profile** to simulate new user experience
- Document everything - it helps with future debugging

**Good luck with testing! 🚀**
