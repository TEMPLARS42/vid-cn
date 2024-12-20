// public/firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/11.0.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.0.2/firebase-messaging-compat.js');

// Initialize Firebase inside the service worker
// const firebaseConfig = JSON.parse(new URL(location).searchParams.get("firebaseConfig"));
const firebaseConfig = {
    apiKey: "AIzaSyAFpexDojG41IlBJQszaN0TZ1C0-X7MGeg",
    appId: "1:134131354710:web:4bb4424e42f9e9fb16bff7",
    authDomain: "web-b5f8d.firebaseapp.com",
    messagingSenderId: "134131354710",
    projectId: "web-b5f8d",
    storageBucket: "web-b5f8d.firebasestorage.app"
}

if (firebaseConfig) {
    firebase.initializeApp(firebaseConfig);

    const messaging = firebase.messaging();
    // Handle background messages
    messaging.onBackgroundMessage((payload) => {
        console.log('[firebase-messaging-sw.js] Received background message ', payload);

        const notificationTitle = payload.notification.title;
        const notificationOptions = {
            body: payload.notification.body,
            icon: '/firebase-logo.png' // Optional: add your own icon
        };

        self.registration.showNotification(notificationTitle, notificationOptions);
    });

}
