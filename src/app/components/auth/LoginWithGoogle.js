"use client"
import { useState } from 'react';
import { auth, provider, storage, db } from '../../utils/firebase';
import { signInWithPopup } from "firebase/auth"; // Authentication module
import { doc, setDoc, getFirestore } from "firebase/firestore"; // Firestore module
import { ref, getStorage, uploadBytes, getDownloadURL } from "firebase/storage"; // Storage module
import { useRouter } from 'next/navigation';


const LoginWithGoogle = () => {
    const { push } = useRouter();
    const handleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Collect additional user information
            const name = user.displayName;
            const mobileNumber = user.phoneNumber;
            const emailId = user.email;
            const imageUrl = null;
            const bio = null;
            // Upload the user's image to Firebase Storage (assuming you have access to the image file)
            // const storageRef = ref(storage, `userImages/${user.uid}`);
            // await uploadBytes(storageRef, userImageFile);

            // // Get the download URL of the uploaded image
            // const imageUrl = await getDownloadURL(storageRef);

            // Save user data to Firestore
            const userDocRef = doc(db, 'users', user.uid);
            await setDoc(userDocRef, {
                name,
                mobileNumber,
                emailId,
                imageUrl,
                bio,
            });

            // Redirect to the chat page
            push('/chat');
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