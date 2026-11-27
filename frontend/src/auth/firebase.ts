import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

// These values identify the Firebase project and are public by design, so they are safe to ship to the browser.
function firebaseConfig() {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  }
}

// Created on first use, so a missing configuration fails at sign-in instead of when the app loads.
export function getFirebaseAuth() {
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig())
  return getAuth(app)
}
