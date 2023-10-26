'use client';
import LoginWithGoogle from "./components/auth/LoginWithGoogle";

// buid basic chat app UI

export default function Home() {
  return (
    <div className="container">
      <LoginWithGoogle />
    </div>
  )
}
