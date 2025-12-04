# **Technical Design Document (TDD): Nexa**

Version: 1.0  
Reference: Aligns with SDD v1.0  
Tech Stack: Next.js 16, React 19, Tailwind 4, Firebase, Turborepo

## **1\. Directory Structure Details**

Detailed breakdown of the apps/web application structure using Next.js 16 App Router.

apps/web/  
├── app/  
│   ├── (auth)/                \# Route Group: Public Auth Pages  
│   │   ├── login/page.tsx  
│   │   ├── signup/page.tsx  
│   │   └── layout.tsx  
│   ├── (dashboard)/           \# Route Group: Protected App Pages  
│   │   ├── layout.tsx         \# Sidebar, Navbar, AuthGuard  
│   │   ├── page.tsx           \# Dashboard Home  
│   │   ├── transactions/  
│   │   ├── accounts/  
│   │   └── budget/  
│   ├── api/                   \# Route Handlers (Edge Functions if needed)  
│   ├── layout.tsx             \# Root Provider wrappers (Query, Theme)  
│   └── globals.css            \# Tailwind 4 imports  
├── lib/  
│   ├── firebase/              \# Firebase Client Initialization  
│   │   ├── client.ts  
│   │   ├── admin.ts           \# (Server-only) Service Account logic  
│   │   └── collections.ts     \# Typed Collection Refs  
│   ├── hooks/                 \# Custom React Hooks  
│   ├── utils.ts               \# cn() and formatters  
│   └── queries/               \# TanStack Query Factories  
├── components/  
│   ├── ui/                    \# Imports from @workspace/ui  
│   ├── forms/                 \# TransactionForm, AccountForm  
│   └── widgets/               \# BalanceCard, ExpensePieChart  
└── middleware.ts              \# Auth protection logic

## **2\. Shared Validators (packages/validators)**

We enforce type safety across the monorepo using Zod.

// packages/validators/index.ts

import { z } from "zod";

export const CurrencyEnum \= z.enum(\["ZMW", "USD", "GBP", "ZAR"\]);  
export const TransactionTypeEnum \= z.enum(\["INCOME", "EXPENSE", "TRANSFER"\]);

export const TransactionSchema \= z.object({  
  amount: z.coerce.number().positive("Amount must be greater than 0"),  
  categoryId: z.string().min(1, "Category is required"),  
  accountId: z.string().min(1, "Account is required"),  
  date: z.coerce.date(),  
  description: z.string().optional(),  
  type: TransactionTypeEnum,  
  isRecurring: z.boolean().default(false),  
});

export type TransactionInput \= z.infer\<typeof TransactionSchema\>;

## **3\. State Management (TanStack Query)**

We utilize **Query Key Factories** to ensure cache consistency and easier invalidation.

// apps/web/lib/queries/keys.ts

export const transactionKeys \= {  
  all: \['transactions'\] as const,  
  lists: () \=\> \[...transactionKeys.all, 'list'\] as const,  
  list: (filters: string) \=\> \[...transactionKeys.lists(), { filters }\] as const,  
  details: () \=\> \[...transactionKeys.all, 'detail'\] as const,  
  detail: (id: string) \=\> \[...transactionKeys.details(), id\] as const,  
};

export const accountKeys \= {  
  all: \['accounts'\] as const,  
  details: () \=\> \[...accountKeys.all, 'detail'\] as const,  
};

**Implementation Strategy:**

* **Reading:** useQuery with strict typing from generic Firestore converters.  
* **Writing:** useMutation with onSuccess callback calling queryClient.invalidateQueries(transactionKeys.lists()).

## **4\. Database Layer (Firestore)**

### **4.1 Typed Collection References**

To prevent using "magic strings" for paths, we define a centralized helper.

// apps/web/lib/firebase/collections.ts  
import { collection, doc, CollectionReference, DocumentData } from 'firebase/firestore';  
import { db } from './client';

// Generic converter for type safety  
const createConverter \= \<T extends DocumentData\>() \=\> ({  
  toFirestore: (data: T) \=\> data,  
  fromFirestore: (snap: any) \=\> snap.data() as T,  
});

export const getTransactionsRef \= (userId: string) \=\>   
  collection(db, 'users', userId, 'transactions').withConverter(createConverter\<Transaction\>());

export const getAccountsRef \= (userId: string) \=\>   
  collection(db, 'users', userId, 'accounts').withConverter(createConverter\<Account\>());

### **4.2 Security Rules (Implementation)**

File: firebase/firestore.rules

rules\_version \= '2';  
service cloud.firestore {  
  match /databases/{database}/documents {  
      
    // Helper function  
    function isOwner(userId) {  
      return request.auth \!= null && request.auth.uid \== userId;  
    }

    // Validation function  
    function isValidTransaction() {  
      // Ensure amount is number and positive  
      return request.resource.data.amount is number   
             && request.resource.data.amount \> 0;  
    }

    match /users/{userId} {  
      allow read, write: if isOwner(userId);  
        
      match /transactions/{txnId} {  
        allow read: if isOwner(userId);  
        allow create: if isOwner(userId) && isValidTransaction();  
        allow update, delete: if isOwner(userId);  
      }  
        
      match /accounts/{accountId} {  
        allow read, write: if isOwner(userId);  
      }  
        
      // ... similar for other subcollections  
    }  
  }  
}

## **5\. Backend Services (Cloud Functions)**

### **5.1 The "Balance Keeper" Algorithm**

This function maintains the integrity of Account Balances. It handles Create, Update, and Delete events transactionally.

**File:** firebase/functions/src/triggers/onTransactionWrite.ts

import \* as functions from "firebase-functions";  
import \* as admin from "firebase-admin";

export const onTransactionWrite \= functions.firestore  
  .document("users/{userId}/transactions/{txnId}")  
  .onWrite(async (change, context) \=\> {  
    const { userId } \= context.params;  
    const db \= admin.firestore();

    const oldData \= change.before.exists ? change.before.data() : null;  
    const newData \= change.after.exists ? change.after.data() : null;

    // 1\. Handle Creation  
    if (\!oldData && newData) {  
      const accountRef \= db.doc(\`users/${userId}/accounts/${newData.accountId}\`);  
      await db.runTransaction(async (t) \=\> {  
        const accDoc \= await t.get(accountRef);  
        if (\!accDoc.exists) return;  
          
        const currentBal \= accDoc.data()?.currentBalance || 0;  
        const multiplier \= newData.type \=== 'INCOME' ? 1 : \-1;  
        t.update(accountRef, {  
          currentBalance: currentBal \+ (newData.amount \* multiplier)  
        });  
      });  
    }

    // 2\. Handle Deletion  
    else if (oldData && \!newData) {  
      const accountRef \= db.doc(\`users/${userId}/accounts/${oldData.accountId}\`);  
      await db.runTransaction(async (t) \=\> {  
        const accDoc \= await t.get(accountRef);  
        const currentBal \= accDoc.data()?.currentBalance || 0;  
        const multiplier \= oldData.type \=== 'INCOME' ? \-1 : 1; // Reverse logic  
        t.update(accountRef, {  
          currentBalance: currentBal \+ (oldData.amount \* multiplier)  
        });  
      });  
    }

    // 3\. Handle Update (Move amounts or Switch Accounts)  
    else if (oldData && newData) {  
      // Logic: Reverse old transaction, Apply new transaction  
      // Note: Must handle case where accountId changed  
    }  
  });

## **6\. Authentication Flow (Next.js Middleware)**

We use a hybrid approach: Client SDK for UI state, and Middleware for route protection.

**File:** apps/web/middleware.ts

import { NextResponse } from 'next/server';  
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {  
  const session \= request.cookies.get('session'); // Set by client on login

  // Protect Dashboard  
  if (request.nextUrl.pathname.startsWith('/dashboard')) {  
    if (\!session) {  
      return NextResponse.redirect(new URL('/login', request.url));  
    }  
  }

  // Redirect if already logged in  
  if (request.nextUrl.pathname \=== '/login' && session) {  
    return NextResponse.redirect(new URL('/dashboard', request.url));  
  }

  return NextResponse.next();  
}

## **7\. UI Components Specifications**

### **7.1 TransactionForm.tsx**

* **Props:**  
  * initialData?: TransactionInput (for edit mode).  
  * accounts: Account\[\] (for dropdown).  
  * categories: Category\[\] (for dropdown).  
  * onSubmit: (data: TransactionInput) \=\> Promise\<void\>.  
* **Behavior:**  
  * Uses useForm\<TransactionInput\> with zodResolver.  
  * Dynamic switching: If type is "TRANSFER", show "To Account" field.  
  * Submit button shows loading state during mutation.

### **7.2 BudgetProgressBar.tsx**

* **Props:**  
  * categoryName: string.  
  * budgetAmount: number.  
  * spentAmount: number.  
  * currency: string.  
* **Logic:**  
  * Calculate percentage: (spent / budget) \* 100\.  
  * Color logic:  
    * \< 75%: bg-green-500  
    * 75% \- 90%: bg-yellow-500  
    * 90%: bg-red-500

## **8\. Deployment Strategy**

### **8.1 Environment Variables**

Managed via T3 Env for strict validation at build time.  
File: apps/web/env.mjs  
export const env \= createEnv({  
  server: {  
    FIREBASE\_PROJECT\_ID: z.string(),  
    FIREBASE\_CLIENT\_EMAIL: z.string().email(),  
    FIREBASE\_PRIVATE\_KEY: z.string(),  
  },  
  client: {  
    NEXT\_PUBLIC\_FIREBASE\_API\_KEY: z.string(),  
    NEXT\_PUBLIC\_FIREBASE\_AUTH\_DOMAIN: z.string(),  
    NEXT\_PUBLIC\_APP\_URL: z.string().url(),  
  },  
  runtimeEnv: {  
    // ... process.env mapping  
  },  
});

### **8.2 Build Command**

pnpm turbo build \-\> Triggers build for apps/web and necessary package transpilation.