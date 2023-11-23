'use client'
import React, { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { socket } from '../../utils/socket'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '../../utils/firebase'
import fetchUser from '../../utils/fetchuser'
import 'react-responsive-modal/styles.css'
import { Modal } from 'react-responsive-modal'
import {
    collection,
    query,
    where,
    doc,
    setDoc,
    addDoc,
    getDoc,
    getDocs,
} from 'firebase/firestore'
import { ref, getStorage, uploadBytes, getDownloadURL } from 'firebase/storage' // Storage module

import Chatbar from './Chatbar'
import Chatbubble from './Chatbubble'
import Chatinput from '../../components/chatpage/Chatinput'

const ChatApp = () => {
    const router = useRouter()
    const storage = getStorage()
    const chatContainerRef = useRef(null)
    const searchParams = useSearchParams()
    const [isConnected, setIsConnected] = useState(false)
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [user, setUser] = useState('')
    const [userName, setUserName] = useState('UserName')
    const [userImage, setUserImage] = useState('')
    const [people, setPeople] = useState('')
    const [open, setOpen] = useState(false)
    const [openRemove, setOpenRemove] = useState(false)
    const [groupId, setGroupId] = useState('')
    const [groupName, setGroupName] = useState('')
    const [groupImg, setGroupImg] = useState('')
    const [groupMembersId, setGroupMembersId] = useState([])
    const [groupMembers, setGroupMembers] = useState([])
    const [downloadTxt, setDownloadTxt] = useState([])

    const onOpenModal = () => setOpen(true)
    const onCloseModal = () => setOpen(false)
    const onOpenRemoveModal = () => setOpenRemove(true)
    const onCloseRemoveModal = () => setOpenRemove(false)

    // connect user to socket, set user profile and group id
    useEffect(() => {
        socket.on('connect', () => {
            if (socket.recovered) {
                console.log('Recovered connection')
            }
            setIsConnected(true)
        })

        socket.on('disconnect', () => {
            setIsConnected(false)
        })
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user.uid)
                setUserName(user.displayName)
                setUserImage(user.photoURL)
                socket.emit('new-user', user.uid)
                console.log('logged in as: ', user.uid)
            } else {
                alert('Please login to continue')
                router.push('/')
            }
        })

        // set group details
        setGroupId(searchParams.get('id'))

        return () => {
            socket.off('connect')
            socket.off('disconnect')
        }
    }, [])

    // log save messages into firebase.
    useEffect(() => {
        if (groupId != '')
            setDoc(doc(db, 'messages', groupId), {
                data: JSON.stringify(messages),
            })
    }, [messages])

    // get messages from socket
    useEffect(() => {
        socket.on('message', (message) => {
            // get only those messages whose groupId matches our current group
            let messageList = []
            if (message.groupId == groupId) {
                // if the message is sent by our message reciever to us, only then add it to the list
                messageList.push(message)
            }
            setMessages((messages) => messages.concat(messageList))
        })
        return () => {
            socket.off('message')
        }
    }, [socket, messages, user])

    // get group data
    useEffect(() => {
        if (groupId != '') {
            getGroupData(groupId)
        }
    }, [groupId])

    // get previous messages from firestore and set them in messages array
    useEffect(() => {
        if (groupId != '') {
            // get messages from firebase
            const docRef = doc(db, 'messages', groupId)
            getDoc(docRef).then((docSnap) => {
                if (docSnap.exists()) {
                    setMessages(JSON.parse(docSnap.data().data))
                }
            })
        }
    }, [groupId])

    // Function to download a text file with all the text messages
    const downloadTxtFile = () => {
        // Iterate through the messages array and find out the text strings and add them to a new array
        let textMessages = []
        const element = document.createElement('a')
        messages.forEach(async (message) => {
            let senderName = ''
            const q = query(collection(db, 'users'))
            const querySnapshot = await getDocs(q)
            querySnapshot.forEach((doc) => {
                const data = doc.data()
                if (doc.id === message.sender) {
                    senderName = data.name
                }
            })
            if (typeof message.message === 'string') {
                textMessages.push({
                    message: message.message,
                    sender: senderName,
                    time: message.time,
                })
                setDownloadTxt([...textMessages])
            }
        })
    }

    useEffect(() => {
        if (downloadTxt.length == 0) return
        const element = document.createElement('a')
        const file = new Blob([JSON.stringify(downloadTxt)], {
            type: 'text/plain',
        })
        element.href = URL.createObjectURL(file)
        element.download = `messages_${groupName}.txt`
        document.body.appendChild(element) // Required for this to work in FireFox
        element.click()
    }, [downloadTxt])

    // get current time
    function getCurrentTime() {
        const now = new Date()
        const hours = now.getHours()
        const minutes = now.getMinutes()
        const amOrPm = hours >= 12 ? 'PM' : 'AM'

        // Convert to 12-hour format
        const formattedHours = hours % 12 || 12

        // Ensure the hours and minutes are displayed with leading zeros if needed
        const formattedTime = `${String(formattedHours).padStart(
            2,
            '0',
        )}:${String(minutes).padStart(2, '0')}`

        return `${formattedTime} ${amOrPm}`
    }

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop =
                chatContainerRef.current.scrollHeight
        }
    }, [messages])

    // get group data from id
    const getGroupData = async (groupId) => {
        try {
            const querySnapshot = await getDocs(collection(db, 'groups'))
            querySnapshot.forEach((doc) => {
                if (doc.id == groupId) {
                    setGroupName(doc.data().name)
                    setGroupImg(doc.data().imageUrl)
                    setGroupMembersId(doc.data().members)
                }
            })
        } catch (error) {
            console.log('Error getting document:', error)
        }
    }

    // get group memebers usernames from ids
    useEffect(() => {
        if (groupMembersId.length > 0) {
            let members = []
            groupMembersId.forEach(async (memberId) => {
                const q = query(collection(db, 'users'))
                const querySnapshot = await getDocs(q)
                querySnapshot.forEach((doc) => {
                    const data = doc.data()
                    if (doc.id === memberId) {
                        // members.push(doc.id,...data)
                        members.push({ id: doc.id, ...data })
                        setGroupMembers([...members])
                    }
                })
            })
        }
    }, [groupMembersId])

    // send message to socket
    const handleSendMessage = () => {
        if (
            typeof newMessage === 'string' &&
            !newMessage.startsWith('blob:') &&
            newMessage.trim() !== ''
        ) {
            setMessages([
                ...messages,
                {
                    message: newMessage,
                    sender: user,
                    groupId,
                    time: getCurrentTime(),
                },
            ])
            socket.emit('new-message', {
                message: newMessage,
                sender: user,
                groupId,
                time: getCurrentTime(),
            })
            setNewMessage('')
        } else if (typeof newMessage !== 'string') {
            let date = new Date()
            let metadata
            if (newMessage.type === 'image') {
                metadata = {
                    contentType: 'image/jpg',
                }
            } else if (newMessage.type === 'video') {
                metadata = {
                    contentType: 'video/mp4',
                }
            } else if (newMessage.type === 'audio') {
                metadata = {
                    contentType: 'audio/mp3',
                }
            } else {
                metadata = {
                    contentType: 'application/pdf',
                }
            }
            const storageRef = ref(storage, `chats/${groupId + date}`)
            uploadBytes(storageRef, newMessage.url, metadata).then(
                (snapshot) => {
                    getDownloadURL(storageRef)
                        .then((downloadURL) => {
                            setMessages([
                                ...messages,
                                {
                                    message: {
                                        type: newMessage.type,
                                        url: downloadURL,
                                    },
                                    sender: user,
                                    groupId,
                                    time: getCurrentTime(),
                                },
                            ])
                            socket.emit('new-message', {
                                message: {
                                    type: newMessage.type,
                                    url: downloadURL,
                                },
                                sender: user,
                                groupId,
                                time: getCurrentTime(),
                            })
                        })
                        .catch((error) => {
                            // Handle any errors while getting the download URL
                            console.error('Error getting download URL:', error)
                        })
                },
            )

            setNewMessage('')
        }
    }

    const addMember = async () => {
        var memberId = prompt('Enter the member id:')
        if (memberId == null) return
        setGroupMembersId((prev) => [...prev, memberId])
    }

    // update the member of the group in firebase
    useEffect(() => {
        const addMemberToGroup = async () => {
            if (groupId == '') return
            let docRef = doc(db, 'groups', groupId)
            await setDoc(docRef, {
                imageUrl: groupImg,
                members: groupMembersId,
                name: groupName,
            })
        }
        addMemberToGroup()
    }, [groupMembersId])

    useEffect(() => {
        const fetchUsers = async (user) => {
            try {
                const q = query(
                    collection(db, 'users'),
                    where('__name__', '!=', user),
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
        if (user) {
            fetchUsers(user)
        }
    }, [open, messages])

    const removeMember = async (memberId) => {
        console.log('memberId', memberId)
        if (confirm('Are you sure you want to remove this member?')) {
            setGroupMembersId((prev) => prev.filter((id) => id !== memberId))
            const docRef = doc(db, 'groups', groupId)
            await setDoc(docRef, {
                imageUrl: groupImg,
                members: groupMembersId.filter((id) => id !== memberId),
                name: groupName,
            })
        }
    }

    const exitGroup = async () => {
        if (confirm('Are you sure you want to exit this group?')) {
            const docRef = doc(db, 'groups', groupId)
            await setDoc(docRef, {
                imageUrl: groupImg,
                members: groupMembersId.filter((id) => id !== user),
                name: groupName,
            })
            router.push('/chatlist')
        }
    }

    const videoCall = async () => {
        router.push('/video?createcall=TRUE&&group=TRUE')
    }

    return (
        <div className="flex flex-col h-screen overflow-y-hidden">
            {/* Top Bar */}
            {groupMembers && (
                <Chatbar
                    name={groupName}
                    image={groupImg}
                    groupMembers={groupMembers
                        .map((member) => member.name)
                        .join(', ')}
                    downloadTxt={downloadTxtFile}
                    addMember={onOpenModal}
                    removeMember={onOpenRemoveModal}
                    exitGroup={exitGroup}
                    videoCall={videoCall}
                ></Chatbar>
            )}
            {/* Chat area */}
            <div className="flex pb-[10rem] bg-color-primary-500 dark:bg-color-surface-200 flex-col h-screen">
                <div
                    ref={chatContainerRef}
                    className="flex-1 p-4 overflow-y-auto"
                    id="scroll"
                >
                    <div className="flex flex-1 flex-col space-y-4 h-[100%]">
                        {people &&
                            messages.map((message, index) => (
                                <Chatbubble
                                    key={index}
                                    message={message}
                                    index={index}
                                    user={user}
                                    people={people}
                                ></Chatbubble>
                            ))}
                    </div>
                </div>
                <Chatinput
                    setNewMessage={setNewMessage}
                    newMessage={newMessage}
                    handleSendMessage={handleSendMessage}
                ></Chatinput>
            </div>
            {/* Modal to add participants in the group */}
            <Modal
                classNames={{
                    modal: 'addParticipantModal',
                }}
                open={open}
                onClose={onCloseModal}
                center
            >
                <div className="flex flex-col items-center w-full">
                    <h1 className="text-2xl font-semibold mb-14 text-white">
                        Add participants to group
                    </h1>
                    {/* Map through the people array and create show item for each of them */}
                    {people &&
                        people.map((person) => (
                            <div
                                key={person.id}
                                className="flex justify-between overflow-auto items-center w-full px-4 py-2 mb-2 bg-color-surface-300 rounded-md"
                            >
                                <div className="flex items-center">
                                    <img
                                        className="w-8 h-8 rounded-full mr-2"
                                        src={
                                            person.imageUrl !== ''
                                                ? person.imageUrl
                                                : 'https://cdn-icons-png.flaticon.com/512/6596/6596121.png'
                                        }
                                        alt=""
                                    />
                                    <p className="text-white">{person.name}</p>
                                </div>
                                <button
                                    className={`bg-color-primary-200 p-2 rounded-md  ${
                                        groupMembersId.includes(person.id)
                                            ? 'text-white bg-color-primary-400'
                                            : 'text-white hover:bg-color-primary-300'
                                    }`}
                                    disabled={groupMembersId.includes(
                                        person.id,
                                    )}
                                    onClick={() => {
                                        if (groupMembersId.includes(person.id))
                                            return
                                        setGroupMembersId((prev) => [
                                            ...prev,
                                            person.id,
                                        ])
                                    }}
                                >
                                    {groupMembersId.includes(person.id)
                                        ? 'Added'
                                        : 'Add'}
                                </button>
                            </div>
                        ))}
                </div>
            </Modal>
            {/* Modal to remove participants from the group */}
            <Modal
                classNames={{
                    modal: 'addParticipantModal',
                }}
                open={openRemove}
                onClose={onCloseRemoveModal}
                center
            >
                <div className="flex flex-col items-center w-full">
                    <h1 className="text-2xl font-semibold mb-14 text-white">
                        Add participants to group
                    </h1>
                    {/* Map through the people array and create show item for each of them */}
                    {groupMembers &&
                        groupMembers.map((person) => (
                            <div
                                key={person.id}
                                className="flex justify-between overflow-auto items-center w-full px-4 py-2 mb-2 bg-color-surface-300 rounded-md"
                            >
                                <div className="flex items-center">
                                    <img
                                        className="w-8 h-8 rounded-full mr-2"
                                        src={
                                            person.imageUrl !== ''
                                                ? person.imageUrl
                                                : 'https://cdn-icons-png.flaticon.com/512/6596/6596121.png'
                                        }
                                        alt=""
                                    />
                                    <p className="text-white">{person.name}</p>
                                </div>
                                <button
                                    className={`bg-color-primary-200 p-2 rounded-md  `}
                                    onClick={() => {
                                        removeMember(person.id)
                                    }}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                </div>
            </Modal>
        </div>
    )
}

export default ChatApp
