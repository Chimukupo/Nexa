/**
 * Firebase Cloud Functions Entry Point
 * 
 * Exports all Cloud Functions for deployment.
 * 
 * Functions are organized into:
 * - triggers/: Firestore event triggers
 * - scheduled/: Scheduled functions (cron jobs)
 */

// Initialize Firebase Admin SDK
import * as admin from "firebase-admin";
admin.initializeApp();

// Export Firestore triggers
export {onTransactionWrite} from "./triggers/onTransactionWrite";

// Export scheduled functions
export {processRecurringRules} from "./scheduled/processRecurringRules";
