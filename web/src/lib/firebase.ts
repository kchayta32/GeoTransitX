import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCfIOASkjDuFL1CA2UBkIm8HqHc04ptYjY",
  authDomain: "geotransitx.firebaseapp.com",
  projectId: "geotransitx",
  storageBucket: "geotransitx.firebasestorage.app",
  messagingSenderId: "826199103560",
  appId: "1:826199103560:web:e7e8f4b210f7d248d0207d",
  measurementId: "G-7J6GBRHCCZ"
};

// Initialize Firebase safely for SSR (Next.js)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let analyticsInstance: any = null;

export const initFirebaseAnalytics = async () => {
  if (typeof window !== "undefined") {
    try {
      const supported = await isSupported();
      if (supported && !analyticsInstance) {
        analyticsInstance = getAnalytics(app);
      }
    } catch (e) {
      console.warn("Firebase Analytics could not be initialized:", e);
    }
  }
  return analyticsInstance;
};

export { app, analyticsInstance as analytics };
