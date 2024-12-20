import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import axios from 'axios';
import store from '../store/store';
import { updateNotificationCount } from '../store/user-slice';

// Firebase configuration object (replace with your own Firebase config)
const firebaseConfig = {
    apiKey: process.env.CONFIG_FIREBASE_API_KEY,
    authDomain: process.env.CONFIG_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.CONFIG_FIREBASE_PROJECT_ID,
    storageBucket: process.env.CONFIG_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.CONFIG_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.CONFIG_FIREBASE_APP_ID
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase Messaging
const messaging = getMessaging(firebaseApp);

const registerServiceWorker = async (config) => {
    if ('serviceWorker' in navigator) {
        const encodedFirebaseConfig = encodeURIComponent(JSON.stringify(config));

        // Register the service worker with the Firebase config dynamically
        try {
            await navigator.serviceWorker.register(`/firebase-messaging-sw.js?firebaseConfig=${encodedFirebaseConfig}`);
            // console.log('Service Worker registered with scope:', registration.scope);
        } catch (error) {
            console.log('Service Worker registration failed:', error);
        }
    }
};

// Function to request Notification permission and retrieve FCM token
export const initializeFirebaseConnection = async () => {
    if (Notification.permission === 'granted') {
        await registerServiceWorkerAndGetToken();
    } else {
        Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
                registerServiceWorkerAndGetToken();
            }
        });
    }
};

const registerServiceWorkerAndGetToken = async () => {
    try {
        await registerServiceWorker(firebaseConfig)

        // Get FCM Token
        const currentToken = await getToken(messaging, { vapidKey: process.env.CONFIG_FIREBASE_VAPID_KEY });
        if (currentToken) {
            // console.log("FCM token received:", currentToken);

            // Listen for foreground messages
            onMessage(messaging, (payload) => {
                console.log("Message received in foreground:", payload);
                // adding motification to redux store.....
                store.dispatch(updateNotificationCount(1));
            });

            // Send token to backend
            await axios.post("/api/subscribe-notifications", { deviceToken: currentToken });
        } else {
            console.log("No registration token available.");
        }
    } catch (error) {
        console.error("Error registering service worker:", error);
    }
};

// Export messaging instance for use in other parts of your app
export { messaging };
