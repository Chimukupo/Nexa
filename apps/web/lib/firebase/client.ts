"use client"

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";
import { getAnalytics, Analytics } from "firebase/analytics";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { env } from "@/env.mjs";

/**
 * Firebase Client SDK Configuration
 * 
 * Initializes and exports Firebase services for client-side use.
 * All services are initialized once and reused across the application.
 */

// Firebase configuration from validated environment variables
const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase App
const apps = getApps();
const app: FirebaseApp =
  apps.length === 0
    ? initializeApp(firebaseConfig)
    : apps[0]!; // Non-null assertion: we know it exists because length > 0

// Initialize Firestore Database
export const db: Firestore = getFirestore(app);

// Initialize Firebase Authentication
export const auth: Auth = getAuth(app);

// Initialize Firebase Storage
export const storage: FirebaseStorage = getStorage(app);

// Initialize Analytics (only in browser)
let analytics: Analytics | null = null;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { app, analytics };

