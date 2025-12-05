"use client"

import {
  collection,
  doc,
  CollectionReference,
  DocumentReference,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "./client";
import type {
  UserProfile,
  Account,
  Category,
  Transaction,
  RecurringRule,
} from "@workspace/validators";

/**
 * Typed Collection References for Firestore
 * 
 * Provides type-safe collection and document references with converters
 * to ensure data consistency and type safety throughout the application.
 */

/**
 * Generic converter factory for Firestore documents
 * Handles Timestamp to Date conversion automatically
 */
function createConverter<T extends DocumentData>() {
  return {
    toFirestore: (data: T): DocumentData => {
      // Convert Date objects to Firestore Timestamps if needed
      // Firestore SDK handles this automatically, but we can add custom logic here
      return data;
    },
    fromFirestore: (snap: QueryDocumentSnapshot): T => {
      const data = snap.data();
      
      // Convert Firestore Timestamps to JavaScript Dates
      const converted: Record<string, unknown> = { ...data };
      
      // Helper to convert Timestamp fields
      const convertTimestamp = (value: unknown): unknown => {
        if (value && typeof value === "object" && "toDate" in value) {
          return (value as { toDate: () => Date }).toDate();
        }
        return value;
      };
      
      // Convert common timestamp fields
      if (converted.createdAt) converted.createdAt = convertTimestamp(converted.createdAt);
      if (converted.updatedAt) converted.updatedAt = convertTimestamp(converted.updatedAt);
      if (converted.date) converted.date = convertTimestamp(converted.date);
      if (converted.lastRunDate) converted.lastRunDate = convertTimestamp(converted.lastRunDate);
      if (converted.targetDate) converted.targetDate = convertTimestamp(converted.targetDate);
      
      return converted as T;
    },
  };
}

/**
 * User Profile Collection Reference
 */
export function getUserDoc(userId: string): DocumentReference<UserProfile> {
  return doc(db, "users", userId).withConverter(createConverter<UserProfile>());
}

/**
 * Accounts Collection References
 */
export function getAccountsRef(
  userId: string,
): CollectionReference<Account> {
  return collection(db, "users", userId, "accounts").withConverter(
    createConverter<Account>(),
  );
}

export function getAccountDoc(
  userId: string,
  accountId: string,
): DocumentReference<Account> {
  return doc(db, "users", userId, "accounts", accountId).withConverter(
    createConverter<Account>(),
  );
}

/**
 * Categories Collection References
 */
export function getCategoriesRef(
  userId: string,
): CollectionReference<Category> {
  return collection(db, "users", userId, "categories").withConverter(
    createConverter<Category>(),
  );
}

export function getCategoryDoc(
  userId: string,
  categoryId: string,
): DocumentReference<Category> {
  return doc(db, "users", userId, "categories", categoryId).withConverter(
    createConverter<Category>(),
  );
}

/**
 * Transactions Collection References
 */
export function getTransactionsRef(
  userId: string,
): CollectionReference<Transaction> {
  return collection(db, "users", userId, "transactions").withConverter(
    createConverter<Transaction>(),
  );
}

export function getTransactionDoc(
  userId: string,
  transactionId: string,
): DocumentReference<Transaction> {
  return doc(db, "users", userId, "transactions", transactionId).withConverter(
    createConverter<Transaction>(),
  );
}

/**
 * Recurring Rules Collection References
 */
export function getRecurringRulesRef(
  userId: string,
): CollectionReference<RecurringRule> {
  return collection(db, "users", userId, "recurring_rules").withConverter(
    createConverter<RecurringRule>(),
  );
}

export function getRecurringRuleDoc(
  userId: string,
  ruleId: string,
): DocumentReference<RecurringRule> {
  return doc(db, "users", userId, "recurring_rules", ruleId).withConverter(
    createConverter<RecurringRule>(),
  );
}

