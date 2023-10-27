"use client"
import { useState } from 'react';
import { auth, provider, storage, db } from '../../utils/firebase';
import { signInWithPopup } from "firebase/auth"; // Authentication module
import { doc, getDoc } from "firebase/firestore"; // Firestore module
// import { ref, getStorage, uploadBytes, getDownloadURL } from "firebase/storage"; // Storage module
import { useRouter } from 'next/navigation';


const LoginWithGoogle = () => {
    const { push } = useRouter();
    const handleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, provider)
            console.log(result)
            const user = result.user;
            const userDocRef = doc(db, 'users', user.uid);
            getDoc(userDocRef)
                .then((docSnap) => {
                    if (docSnap.exists()) {
                        console.log("Existing user logged in.");
                        const user = result.user;
                        push('/chatlist');
                    } else {
                        console.log("New user registered!");
                        push('/profile')
                    }
                })
                .catch((error) => {
                    console.error("Error checking user document:", error);
                });
            // const user = result.user;
            // Redirect to the chat page
        } catch (error) {
            console.error(error);
        }
    };


    return (
        <div className='h-screen w-screen bg-color-primary-300 dark:bg-color-surface-100 flex flex-col items-center justify-center'>
            <div className='w-[40%] h-[40%] bg-color-primary-500 dark:bg-color-surface-300 rounded-xl flex flex-col items-center justify-center'>
                <h1 className='text-black dark:text-white text-5xl text-center my-2'>Hi! welcome to Chit-Chat</h1>
                <h3 className='text-black dark:text-white text-3xl text-center my-5'>Click on the button to signin to your account</h3>
                <button onClick={handleLogin} class="px-4 py-2  border flex gap-2 border-black dark:border-color-primary-200 rounded-lg text-slate-700 dark:text-slate-200 hover:border-color-primary-300 dark:hover:border-color-primary-500 hover:text-slate-900 dark:hover:text-color-primary-500 hover:shadow transition duration-150">
                    <img class="w-6 h-6" src="https://www.svgrepo.com/show/475656/google-color.svg" loading="lazy" alt="google logo" />
                    <span>Login with Google</span>
                </button>
            </div>
        </div>
    )
}

export default LoginWithGoogle;