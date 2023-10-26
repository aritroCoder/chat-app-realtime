"use client";
import React, { useState, useRef, useEffect } from 'react';
import { BsPencilSquare } from 'react-icons/bs';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from '../utils/firebase';

const Profile = () => {
    const fileInputRef = useRef(null);
    const [profileImage, setProfileImage] = useState(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [bio, setBio] = useState('');

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setName(user.displayName);
                setEmail(user.email);
                setMobile(user.phoneNumber);
                setProfileImage(user.photoURL);
            } else {
                alert('Please login to continue');
                push('/');
            }
        });
    }, [])
    

    const onImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setProfileImage(URL.createObjectURL(file));
        }
    };

    return (
        <div className="h-screen w-screen bg-color-primary-300 dark:bg-color-surface-100 flex flex-col items-center justify-center">
            <div className="w-3/4 h-4/5 bg-color-primary-500 dark:bg-color-surface-300 rounded-xl flex flex-col items-center">
                <h1 className="my-5 text-black dark:text-white text-7xl">Profile</h1>
                <div className="w-40 h-40 rounded-full overflow-hidden flex items-end justify-end">
                    <img
                        src={profileImage || 'https://img.freepik.com/premium-vector/man-character_665280-46970.jpg'}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onClick={() => {
                            if (fileInputRef.current) {
                                fileInputRef.current.click();
                            }
                        }}
                    />
                    <div className='w-12 h-12 bg-color-primary-100 dark:bg-color-primary-100 absolute rounded-full flex items-center justify-center text-2xl cursor-pointer' onClick={() => {
                        if (fileInputRef.current) {
                            fileInputRef.current.click();
                        }
                    }}><BsPencilSquare /></div>
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={onImageUpload}
                    style={{ display: 'none' }}
                />
                <div className="my-4 max-w-[600px] w-1/2 space-y-2">
                    <div className="flex items-center">
                        <span className="w-1/4 text-black dark:text-white">Name:</span>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-3/4 p-2 border-b-[1px] outline-none text-black dark:text-white bg-transparent border-black dark:border-white"
                        />
                    </div>
                    <div className="flex items-center">
                        <span className="w-1/4 text-black dark:text-white">Email:</span>
                        <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-3/4 p-2 border-b-[1px] outline-none text-black dark:text-white bg-transparent border-black dark:border-white"
                        />
                    </div>
                    <div className="flex items-center">
                        <span className="w-1/4 text-black dark:text-white">Mobile:</span>
                        <input
                            type="text"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            className="w-3/4 p-2 border-b-[1px] outline-none text-black dark:text-white bg-transparent border-black dark:border-white"
                        />
                    </div>
                    <div className="flex items-center">
                        <span className="w-1/4 text-black dark:text-white">Bio:</span>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="w-3/4 p-2 border-b-[1px] outline-none text-black dark:text-white bg-transparent border-black dark:border-white"
                        />
                    </div>

                </div>
                <div className="flex items-center">
                    <button className='w-28 h-12 bg-color-primary-100 rounded-xl my-12 font-semibold'>Submit</button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
