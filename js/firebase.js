import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyA9vMk01-8YCiLXegszeiHXSGeBvy91N2U",
    authDomain: "entrega-chapeco.firebaseapp.com",
    projectId: "entrega-chapeco",
    storageBucket: "entrega-chapeco.firebasestorage.app",
    messagingSenderId: "697262455182",
    appId: "1:697262455182:web:28405a7efa733786e68cdf",
};

const app = initializeApp(firebaseConfig);
<<<<<<< HEAD
export const auth = getAuth(app);
export const db = getFirestore(app);
=======

export const db = getFirestore(app);
export const auth = getAuth(app);
>>>>>>> 31dabdcebcb67e708749791855f8cff6bb2eb6c8
