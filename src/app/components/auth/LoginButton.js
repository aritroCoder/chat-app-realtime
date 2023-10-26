"use client"
import React from 'react';
import './style.css';
const LoginWithGoogleButton = (props) => {
    return (
        <div>
            <button className="google-login-button" onClick={()=>props.onClick()}>
                <div className='bg-white p-1 mr-2 rounded-md'>
                    <img
                        src="https://static-00.iconduck.com/assets.00/google-icon-2048x2048-czn3g8x8.png"
                        alt="Google Logo"
                        className="google-logo"
                    />
                </div>
                Login with Google
            </button>
        </div>
    );
};

export default LoginWithGoogleButton;
