'use client'
import React, { useState, useEffect } from 'react'
import Chatlistbar from '../components/chatpage/Chatlistbar'
import { auth, db } from '../utils/firebase'
import { useRouter } from 'next/navigation'
import {
    collection,
    query,
    where,
    doc,
    getDoc,
    getDocs,
    setDoc,
    addDoc,
} from 'firebase/firestore'
import Link from 'next/link'

const chatlist = () => {
    const { push } = useRouter()
    const [user, setUser] = useState('')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [image, setImage] = useState('')
    const [people, setPeople] = useState('')
    const [groups, setGroups] = useState([])

    const fetchUsers = async (user) => {
        try {
            const q = query(
                collection(db, 'users'),
                where('__name__', '!=', user.uid),
            )
            const querySnapshot = await getDocs(q)
            let userList = []
            querySnapshot.forEach((doc) => {
                const data = doc.data()
                const id = doc.id
                userList.push({ id, ...data })
            })
            setPeople(userList)
        } catch (error) {
            console.error('Error fetching users:', error)
        }
    }

    // get all groups the user is a part of
    const fetchGroups = async (user) => {
        try {
            const q = query(
                collection(db, 'groups'),
                where('members', 'array-contains', user.uid),
            )
            const querySnapshot = await getDocs(q)
            let groupList = []
            querySnapshot.forEach((doc) => {
                const data = doc.data()
                const id = doc.id
                groupList.push({ id, ...data })
            })
            setGroups(groupList)
            console.log(groupList)
        } catch (error) {
            console.error('Error fetching users:', error)
        }
    }

    useEffect(() => {
        auth.onAuthStateChanged((user) => {
            if (user) {
                setUser(user)
                const userDocRef = doc(db, 'users', user.uid)
                getDoc(userDocRef)
                    .then((docSnap) => {
                        if (docSnap.exists()) {
                            const userData = docSnap.data()
                            setName(userData.name || '')
                            setEmail(userData.email || '')
                            setImage(userData.imageUrl || '')
                            // console.log(docSnap.data())
                            setDoc(doc(db, 'users', user.uid), {
                                name: docSnap.data().name,
                                imageUrl: docSnap.data().imageUrl,
                                email: docSnap.data().email,
                                mobile: docSnap.data().mobile,
                                bio: docSnap.data().bio,
                                lastSeen: new Date(),
                            })
                        }
                    })
                    .catch((error) => {
                        console.error('Error checking user document:', error)
                    })
                fetchUsers(user)
                fetchGroups(user)
            } else {
                // alert('Please login to continue');
                push('/')
            }
        })
    }, [])

    const handleLogout = () => {
        // Logout the user and push it to the home page
        auth.signOut()
            .then(() => {
                console.log('User logged out successfully!')
                // Redirect to the home page
                push('/')
            })
            .catch((error) => {
                console.error('Error logging out:', error)
            })
    }

    // handles creating a new group chat
    const handleCreateGroup = () => {
        const groupName = prompt('Enter the group name')
        if (groupName) {
            const groupData = {
                name: groupName,
                imageUrl: '',
                members: [user.uid],
            }
            const groupRef = collection(db, 'groups')
            addDoc(groupRef, groupData)
                .then(() => {
                    console.log('added group data')
                })
                .catch((error) => {
                    console.log('Error creating group: ', error)
                })
        }
    }

    return (
        <>
            <Chatlistbar
                name={name}
                image={image}
                email={email}
                handleLogout={handleLogout}
            />
            <div className="h-full min-h-screen w-full py-4 bg-color-primary-300 dark:bg-color-surface-100 flex flex-col items-center ">
                {people &&
                    people.map((person, index) => (
                        <Link
                            href={{
                                pathname: '/chat',
                                query: { id: person.id },
                            }}
                            key={index}
                            className="w-[95%] overflow-x-hidden rounded-xl py-3 my-4 bg-color-primary-600 dark:bg-color-surface-300"
                        >
                            <div className="flex items-center">
                                <div className="w-12 h-12 mx-5">
                                    <img
                                        className="rounded-full h-12 border-2 border-black dark:border-green-500"
                                        src={person.imageUrl}
                                        alt=""
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <h1 className="text-2xl font-semibold text-white">
                                        {person.name}
                                    </h1>
                                    <h1 className="text-lg text-white">
                                        {person.email}
                                    </h1>
                                </div>
                            </div>
                        </Link>
                    ))}
                {groups &&
                    groups.map((group, index) => (
                        <Link
                            href={{
                                pathname: '/chat/group',
                                query: { id: group.id },
                            }}
                            key={index}
                            className="w-[95%] overflow-x-hidden rounded-xl py-3 my-4 bg-color-primary-600 dark:bg-color-surface-300"
                        >
                            <div className="flex items-center">
                                <div className="w-12 h-12 mx-5">
                                    <img
                                        className="rounded-full h-12 border-2 border-black dark:border-green-500"
                                        src={group.imageUrl}
                                        alt=""
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <h1 className="text-2xl font-semibold text-white">
                                        {group.name}
                                    </h1>
                                    {/*TODO: add group members names from uids using a util function*/}
                                    {/* <h1 className="text-lg text-white">{person.email}</h1> */}
                                </div>
                            </div>
                        </Link>
                    ))}
                <div className="bg-lime-50 p-3 rounded-md hover:bg-lime-100">
                    <button onClick={() => handleCreateGroup()}>
                        Make a group
                    </button>
                </div>
            </div>
        </>
    )
}

export default chatlist
