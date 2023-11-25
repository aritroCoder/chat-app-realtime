'use client'
import LoginWithGoogle from './components/auth/LoginWithGoogle'
// import { Notifications } from 'react-push-notification'
// buid basic chat app UI

export default function Home() {
    return (
        <>
            <div className="container">
            {/* <Notifications /> */}
                <LoginWithGoogle />
            </div>
        </>
    )
}
