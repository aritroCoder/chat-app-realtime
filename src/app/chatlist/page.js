'use client'
import React, { useState, useEffect } from 'react'
import Chatlistbar from '../components/chatpage/Chatlistbar'
import { auth, db, storage } from '../utils/firebase'
import { useRouter } from 'next/navigation'
import 'react-responsive-modal/styles.css'
import { Modal } from 'react-responsive-modal'
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
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Storage module
import Link from 'next/link'

const chatlist = () => {
    const { push } = useRouter()
    const [user, setUser] = useState('')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [image, setImage] = useState('')
    const [people, setPeople] = useState('')
    const [groups, setGroups] = useState([])
    const [open, setOpen] = useState(false)
    const [groupName, setGroupName] = useState('')
    const [groupPic, setGroupPic] = useState('')
    const [groupMembers, setGroupMembers] = useState([])

    const onOpenModal = () => setOpen(true)
    const onCloseModal = () => setOpen(false)

    const fetchUsers = async (user) => {
        try {
            const q = query(
                collection(db, 'users'),
                where('__name__', '!=', user.uid)
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
                where('members', 'array-contains', user.uid)
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
    const handleCreateGroup = async() => {
        // const groupName = prompt('Enter the group name')
        const date = new Date().getTime()
        const storageRef = ref(storage, `groupImages/${date}`);
        await uploadBytes(storageRef, groupPic);

        // Get the download URL of the uploaded image
        const imageUrl = await getDownloadURL(storageRef);
        if (groupName) {
            const groupData = {
                name: groupName,
                imageUrl: imageUrl,
                members: [user.uid],
            }
            const groupRef = collection(db, 'groups')
            addDoc(groupRef, groupData)
                .then(() => {
                    console.log('added group data')
                    onCloseModal()
                    fetchGroups(user)
                })
                .catch((error) => {
                    console.log('Error creating group: ', error)
                })
        }
    }

    const onGroupImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setGroupPic(file);
        }
    };

    useEffect(() => {
        // For each group, get the names of the members in form of a 2D array of objects
        const groupMembersId = groups.map((group) => group.members).flat()
        if (groupMembersId.length > 0) {
            let members = []
            groupMembersId.forEach(async (memberId) => {
                const q = query(collection(db, 'users'))
                const querySnapshot = await getDocs(q)
                querySnapshot.forEach((doc) => {
                    const data = doc.data()
                    if (doc.id === memberId) {
                        members.push({memberId: memberId,name: data.name})
                        setGroupMembers([...members])
                    }
                })
            })
        }
    }, [groups])

    return (
        <>
            <Chatlistbar
                name={name}
                image={image}
                email={email}
                handleLogout={handleLogout}
                onOpenModal={onOpenModal}
            />
            {console.log('groupMembers', groupMembers)}
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
                                        src={group.imageUrl !== '' ? group.imageUrl :'https://cdn-icons-png.flaticon.com/512/6596/6596121.png'}
                                        alt=""
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <h1 className="text-2xl font-semibold text-white">
                                        {group.name}
                                    </h1>
                                    {/*TODO: add group members names from uids using a util function*/}
                                    {/* Find the name of the members of this particular group form the groupMembers by cheking the id of the group member with groupMembers */}
                                    <div className='flex'>
                                    {groupMembers.length>0 &&
                                        group.members.map((memberId, index) => {
                                            const memberName = groupMembers.find(member => member.memberId === memberId)
                                            return <h1 className="text-lg text-white inline" key={index}>
                                                {`${memberName.name},`}&nbsp;
                                            </h1>
                                        }
                                        )
                                    }
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
            </div>
            <Modal
                classNames={{
                    modal: 'makeGrpModal',
                }}
                open={open}
                onClose={onCloseModal}
                center
            >
                <div className="flex flex-col items-center w-full">
                    <h1 className="text-2xl font-semibold mb-14 text-white">
                        Create a group
                    </h1>
                    <h3 className="text-xl text-white mb-2">Enter group name</h3>
                    <input
                        type="text"
                        onChange={(e) => setGroupName(e.target.value)}
                        placeholder="Enter group name"
                        className="border-b-2 border-white bg-color-surface-200 outline-none rounded-md p-2 mb-2 text-white w-3/4"
                    />
                    <h3 className="text-xl text-white mb-2 mt-5">Upload group image</h3>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={onGroupImageUpload}
                        className="border-b-2 border-white bg-color-surface-200 outline-none rounded-md p-2 mb-2 text-white w-3/4"
                    />
                    <button
                        className="bg-color-primary-200 p-2 rounded-md hover:bg-color-primary-300 w-1/4"
                        onClick={() => handleCreateGroup()}
                    >
                        Create
                    </button>
                </div>
            </Modal>
        </>
    )
}

export default chatlist
