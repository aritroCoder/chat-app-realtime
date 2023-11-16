'use client'
import React, { useState, useRef, useEffect } from 'react'
import { BsPencilSquare } from 'react-icons/bs'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db, storage } from '../utils/firebase'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { ref, getStorage, uploadBytes, getDownloadURL } from 'firebase/storage' // Storage module
import { useRouter } from 'next/navigation'

const Profile = () => {
    const fileInputRef = useRef(null)
    const bgInputRef = useRef(null)
    const [profileImage, setProfileImage] = useState(null)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [mobile, setMobile] = useState('')
    const [bio, setBio] = useState('')
    const [imageFile, setImageFile] = useState('')
    const [userUid, setUserUid] = useState('')
    const [docRef, setDocRef] = useState('')
    const [bg, setBg] = useState('')
    const { push } = useRouter()

    useEffect(() => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    // Retrieve user data from Firestore based on the user's UID
                    setUserUid(user.uid)
                    const userDocRef = doc(db, 'users', user.uid)
                    setDocRef(userDocRef)
                    const userDocSnapshot = await getDoc(userDocRef)

                    if (userDocSnapshot.exists()) {
                        const userData = userDocSnapshot.data()
                        setName(userData.name || '')
                        setEmail(userData.email || '')
                        setMobile(userData.mobile || '')
                        setProfileImage(userData.imageUrl || '')
                        setBio(userData.bio || '')
                        setBg(userData.bgUrl || '')
                    } else {
                        setName(user.displayName)
                        setEmail(user.email)
                        setMobile(user.phoneNumber)
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error)
                }
            } else {
                alert('Please login to continue')
                push('/')
            }
        })
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        console.log(name, email, mobile, bio, imageFile)
        // Upload the user's image to Firebase Storage (assuming you have access to the image file)
        const storageRef = ref(storage, `userImages/${userUid}`)
        await uploadBytes(storageRef, imageFile)

        // Get the download URL of the uploaded image
        const imageUrl = await getDownloadURL(storageRef)
        await setDoc(docRef, {
            name,
            mobile,
            email,
            imageUrl,
            bio,
        })
            .then(() => {
                console.log('Document added successfully!')
                // Save the user info to local storage
                let userinfo = {
                    uid: userUid,
                    name: name,
                    email: email,
                    mobile: mobile,
                    image: imageUrl,
                    bio: bio,
                }
                localStorage.setItem('user', JSON.stringify(userinfo))
                push('/chatlist')
            })
            .catch((error) => {
                console.error('Error adding document: ', error)
            })
    }

    const onImageUpload = (event) => {
        const file = event.target.files[0]
        if (file) {
            setImageFile(file)
            setProfileImage(URL.createObjectURL(file))
        }
    }

    const onBgUpload = (event) => {
        const file = event.target.files[0]
        if (file) {
            setBg(URL.createObjectURL(file))
        }
        const uploadBg = async () => {
            const storageRef = ref(storage, `bgImages/${userUid}`)
            await uploadBytes(storageRef, bgInputRef.current.files[0])
            const bgUrl = await getDownloadURL(storageRef)
            await setDoc(docRef, {
                name,
                mobile,
                email,
                profileImage,
                bio,
                bgUrl,
            })
                .then(() => {
                    console.log('Document added successfully!')
                })
                .catch((error) => {
                    console.error('Error adding document: ', error)
                })
        }
        if (bgInputRef.current) {
            uploadBg()
        }
    }

    // useEffect(() => {
    // //   Save the bg image to the google storage and get the url and save it to the firestore
    // const uploadBg = async () => {
    //     const storageRef = ref(storage, `bgImages/${userUid}`)
    //     await uploadBytes(storageRef, bgInputRef.current.files[0])
    //     const bgUrl = await getDownloadURL(storageRef)
    //     await setDoc(docRef, {
    //         bgUrl,
    //     })
    //         .then(() => {
    //             console.log('Document added successfully!')
    //         })
    //         .catch((error) => {
    //             console.error('Error adding document: ', error)
    //         })
    // }
    // if (bgInputRef.current) {
    //     uploadBg()
    // }

    // }, [bg])

    return (
        <div className="h-screen w-screen bg-color-primary-300 dark:bg-color-surface-100 flex flex-col items-center justify-center">
            <div className="w-3/4 h-[90%] bg-color-primary-500 dark:bg-color-surface-300 rounded-xl flex flex-col items-center">
                <h1 className="my-5 text-black dark:text-white text-7xl">
                    Profile
                </h1>
                <div className="w-40 h-40 rounded-full overflow-hidden flex items-end justify-end">
                    <img
                        src={
                            profileImage ||
                            'https://img.freepik.com/premium-vector/man-character_665280-46970.jpg'
                        }
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onClick={() => {
                            if (fileInputRef.current) {
                                fileInputRef.current.click()
                            }
                        }}
                    />
                    <div
                        className="w-12 h-12 bg-color-primary-100 dark:bg-color-primary-100 absolute rounded-full flex items-center justify-center text-2xl cursor-pointer"
                        onClick={() => {
                            if (fileInputRef.current) {
                                fileInputRef.current.click()
                            }
                        }}
                    >
                        <BsPencilSquare />
                    </div>
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
                        <span className="w-1/4 text-black dark:text-white">
                            Name:
                        </span>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-3/4 p-2 border-b-[1px] outline-none text-black dark:text-white bg-transparent border-black dark:border-white"
                        />
                    </div>
                    <div className="flex items-center">
                        <span className="w-1/4 text-black dark:text-white">
                            Email:
                        </span>
                        <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-3/4 p-2 border-b-[1px] outline-none text-black dark:text-white bg-transparent border-black dark:border-white"
                        />
                    </div>
                    <div className="flex items-center">
                        <span className="w-1/4 text-black dark:text-white">
                            Mobile:
                        </span>
                        <input
                            type="text"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            className="w-3/4 p-2 border-b-[1px] outline-none text-black dark:text-white bg-transparent border-black dark:border-white"
                        />
                    </div>
                    <div className="flex items-center">
                        <span className="w-1/4 text-black dark:text-white">
                            Bio:
                        </span>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="w-3/4 p-2 border-b-[1px] outline-none text-black dark:text-white bg-transparent border-black dark:border-white"
                        />
                    </div>
                </div>
                <div className="flex items-center">
                    <button
                        onClick={handleSubmit}
                        className="w-28 h-12 bg-color-primary-100 rounded-xl my-12 font-semibold"
                    >
                        Submit
                    </button>
                </div>
                <h3 className="text-3xl text-black dark:text-white">
                    Theme Setting
                </h3>
                <div className="flex items-center justify-center gap-52">
                    <h3 className="text-xl text-black dark:text-white">
                        Choose the image for chat's walpaper
                    </h3>
                    <div className="flex items-center justify-center gap-4">
                        <button
                            className="w-28 h-12 bg-color-primary-100 rounded-xl my-12 font-semibold"
                            onClick={() => {
                                if (bgInputRef.current) {
                                    bgInputRef.current.click()
                                }
                            }}
                        >
                            Upload
                        </button>
                    </div>
                    <img
                        src={bg}
                        alt="Profile"
                        className="h-40 w-auto object-cover my-3"
                        onClick={() => {
                            if (fileInputRef.current) {
                                fileInputRef.current.click()
                            }
                        }}
                    />
                    <input
                        type="file"
                        ref={bgInputRef}
                        accept="image/*"
                        onChange={onBgUpload}
                        style={{ display: 'none' }}
                    />
                </div>
            </div>
        </div>
    )
}

export default Profile
