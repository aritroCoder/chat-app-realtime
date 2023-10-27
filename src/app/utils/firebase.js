"use client";
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth"
import { getFirestore } from "firebase/firestore"; // Firestore module
import { getStorage } from "firebase/storage"; // Storage module
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyA4G3nAgXGNCadQd7bkmLYEcyROyJzy1FQ",
    authDomain: "chat-app-8b3f26e3f13c97d471d34.firebaseapp.com",
    projectId: "chat-app-8b3f26e3f13c97d471d34",
    storageBucket: "chat-app-8b3f26e3f13c97d471d34.appspot.com",
    messagingSenderId: "926850787785",
    appId: "1:926850787785:web:133f2ff57f7144e2a76018",
    measurementId: "G-0MY8FY9TY7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage();
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

export {auth, provider, storage, db};