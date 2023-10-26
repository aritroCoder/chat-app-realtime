"use client"
import { useState } from 'react';
import {auth, provider} from '../../utils/firebase'
import { signInWithPopup } from "firebase/auth";
import LoginWithGoogleButton from './LoginButton';
import { useRouter } from 'next/navigation';

const LoginWithGoogle = () => {
    const { push } = useRouter();
    const handleLogin = async ()=>{
        console.log({auth, provider})
        let data = await signInWithPopup(auth, provider)
        console.log(data.user)
        // redirect to chat page
        push('/chat')
    }

    return (
        <div>
            <LoginWithGoogleButton onClick={handleLogin} />
        </div>
    )
}

export default LoginWithGoogle;