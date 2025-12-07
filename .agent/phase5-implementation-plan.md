# Phase 5: Income Management & Tax Engine - Implementation Plan

## Overview

This phase focuses on implementing income tracking with net pay calculations and recurring income management. We'll start with core features and keep the tax engine simple for MVP.

## Current Status

- **Phase 4:** ✅ 100% Complete
- **Phase 5:** 👷 0% Complete (Starting Now)

## Priority Tasks (MVP Focus)

### **High Priority - Week 1**

#### 1. Income Category Setup (Task 5.1.3)

**Estimated Time:** 2-3 hours

**Goal:** Create income-specific categories to differentiate income sources

**Implementation:**

- Add income categories to `defaultCategories.ts`:
  - Primary Salary (INCOME)
  - Side Hustle (INCOME)
  - Freelance (INCOME)
  - Dividends (INCOME)
  - Gifts (INCOME)
  - Other Income (INCOME)
- These will auto-initialize with other default categories

**Files to Modify:**

- `apps/web/lib/data/defaultCategories.ts`

**Success Criteria:**

- Users see income-specific categories when creating income transactions
- Categories are properly filtered by type in forms

---

#### 2. Income Summary Widget (Task 5.1.4)

**Estimated Time:** 4-5 hours

**Goal:** Display monthly income breakdown on dashboard

**Implementation:**

- Create `apps/web/components/widgets/IncomeSummary.tsx`
- Fetch income transactions for current month
- Group by category to show income sources
- Display total income prominently
- Add to dashboard page

**Features:**

- Total monthly income (large number)
- Breakdown by source (Primary Salary: K5000, Side Hustle: K500, etc.)
- Comparison with previous month (optional)
- Click to view all income transactions

**Files to Create:**

- `apps/web/components/widgets/IncomeSummary.tsx`

**Files to Modify:**

- `apps/web/app/(dashboard)/dashboard/page.tsx`

**Success Criteria:**

- Widget displays on dashboard
- Shows accurate income totals
- Breaks down by income source
- Updates in real-time when transactions change

---

### **Medium Priority - Week 2**

#### 3. Recurring Income Setup (Tasks 5.2.1, 5.2.2, 5.2.3)

**Estimated Time:** 8-10 hours

**Goal:** Allow users to set up recurring income (e.g., monthly salary)

**Implementation Steps:**

**Step 1: Create Recurring Rules Hooks (5.2.1)**

- Create `apps/web/lib/hooks/useRecurringRules.ts`
- Implement CRUD operations using TanStack Query
- Add Firestore collection: `users/{userId}/recurringRules`
- Schema fields:
  ```typescript
  {
    name: string;
    amount: number;
    type: "INCOME" | "EXPENSE";
    dayOfMonth: number; // 1-31
    accountId: string;
    categoryId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  ```

**Step 2: Create Recurring Rule Form (5.2.2)**

- Create `apps/web/components/forms/RecurringRuleForm.tsx`
- Form fields: name, amount, type, dayOfMonth, account, category
- Use React Hook Form + Zod validation
- Day of month selector (1-31)

**Step 3: Integrate into Transaction Flow (5.2.3)**

- Add "Set as Recurring" checkbox in TransactionForm
- When checked, create recurring rule from transaction data
- Add recurring rules management page in Settings
- Display list of active recurring rules
- Allow edit/delete/toggle active status

**Files to Create:**

- `apps/web/lib/hooks/useRecurringRules.ts`
- `apps/web/components/forms/RecurringRuleForm.tsx`
- `apps/web/app/(dashboard)/settings/recurring/page.tsx` (optional)

**Files to Modify:**

- `apps/web/components/forms/TransactionForm.tsx`
- `apps/web/app/(dashboard)/settings/page.tsx`

**Success Criteria:**

- Users can create recurring income rules
- Rules are saved to Firestore
- Users can view/edit/delete rules
- Checkbox in transaction form works correctly

---

### **Low Priority - Future Enhancement**

#### 4. Advanced Mode Income Entry (Task 5.1.2)

**Estimated Time:** 6-8 hours

**Goal:** Allow users to enter gross income and deductions

**Implementation:**

- Add toggle in TransactionForm for Simple/Advanced mode
- Advanced mode shows:
  - Gross Amount field
  - Deductions field (or breakdown: PAYE, NHIMA, NAPSA)
  - Auto-calculated Net Pay: `net = gross - deductions`
  - Display calculation breakdown
- Save both gross and net amounts to transaction
- Update schema to include `grossAmount` and `deductions` (optional fields)

**Files to Modify:**

- `packages/validators/src/transaction.ts` (add optional fields)
- `apps/web/components/forms/TransactionForm.tsx`

**Success Criteria:**

- Toggle between Simple/Advanced modes
- Gross and deductions fields appear in Advanced mode
- Net pay auto-calculates correctly
- Both amounts saved to database

**Note:** This can be deferred to Phase 10 (Polish) if time is limited.

---

## Implementation Order

### **Sprint 1 (This Week)**

1. ✅ Add income categories to defaults
2. ✅ Create Income Summary Widget
3. ✅ Add widget to dashboard

### **Sprint 2 (Next Week)**

4. ✅ Create recurring rules hooks
5. ✅ Create recurring rule form
6. ✅ Integrate into transaction flow
7. ✅ Add recurring rules management UI

### **Future (Phase 10)**

8. ⏳ Implement Advanced Mode (gross/deductions)
9. ⏳ Add tax calculation engine
10. ⏳ Create tax reports

---

## Technical Considerations

### **Firestore Structure**

```
users/
  {userId}/
    recurringRules/
      {ruleId}/
        - name: string
        - amount: number
        - type: "INCOME" | "EXPENSE"
        - dayOfMonth: number
        - accountId: string
        - categoryId: string
        - isActive: boolean
        - createdAt: timestamp
        - updatedAt: timestamp
```

### **Recurring Rule Execution**

**Note:** Actual execution of recurring rules (auto-creating transactions) will be handled in Phase 6 (Automation). For now, we're just setting up the rules.

Future implementation will use:

- Cloud Functions scheduled daily
- Check all active rules
- Create transactions on specified day of month
- Mark as "auto-generated"

---

## Testing Checklist

### Income Categories

- [ ] Income categories appear in category list
- [ ] Can create income transaction with income category
- [ ] Categories filter correctly by type

### Income Summary Widget

- [ ] Widget displays on dashboard
- [ ] Shows correct total income for current month
- [ ] Breaks down by income source
- [ ] Updates when new income added
- [ ] Handles zero income gracefully

### Recurring Rules

- [ ] Can create recurring income rule
- [ ] Can create recurring expense rule
- [ ] Can edit existing rule
- [ ] Can delete rule
- [ ] Can toggle active/inactive
- [ ] Rules persist after page refresh
- [ ] Form validation works correctly

---

## Success Metrics

- ✅ Users can track income from multiple sources
- ✅ Dashboard shows monthly income summary
- ✅ Users can set up recurring income (e.g., salary)
- ✅ Income categories properly organized
- ✅ All features work smoothly without bugs

---

## Next Steps After Phase 5

**Phase 6: Budgeting & Goals**

- Monthly budget setup
- Budget tracking by category
- Savings goals
- Budget vs actual reports

**Phase 7: Reports & Analytics**

- Income vs expenses charts
- Category breakdown
- Trends over time
- Export to CSV/PDF

---

## Notes

- Keep it simple for MVP
- Focus on core functionality
- Advanced features can wait
- Ensure good UX for common use cases
- Test thoroughly before moving to Phase 6
