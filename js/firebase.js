import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyA9vMk01-8YCiLXegszeiHXSGeBvy91N2U",
    authDomain: "entrega-chapeco.firebaseapp.com",
    projectId: "entrega-chapeco",
    storageBucket: "entrega-chapeco.firebasestorage.app",
    messagingSenderId: "697262455182",
    appId: "1:697262455182:web:28405a7efa733786e68cdf",

};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);