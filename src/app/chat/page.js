'use client'
import React, { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { socket } from '../utils/socket'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '../utils/firebase'
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

import Chatbar from '../components/chatpage/Chatbar'
import Chatbubble from '../components/chatpage/Chatbubble'
import Chatinput from '../components/chatpage/Chatinput'

const ChatApp = () => {
    const router = useRouter()
    const storage = getStorage()
    const myRef = useRef(null)
    const chatContainerRef = useRef(null)
    const searchParams = useSearchParams()
    const [isConnected, setIsConnected] = useState(false)
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [user, setUser] = useState('')
    const [userName, setUserName] = useState('UserName')
    const [userImage, setUserImage] = useState(
        'https://images.ctfassets.net/hrltx12pl8hq/12wPNuS1sirO3hOes6l7Ds/9c69a51705b4a3421d65d6403ec815b1/non_cheesy_stock_photos_cover-edit.jpg',
    )
    const [recieverId, setRecieverId] = useState('')
    const [recieverName, setRecieverName] = useState('')
    const [recieverImg, setRecieverImg] = useState(
        'https://images.ctfassets.net/hrltx12pl8hq/12wPNuS1sirO3hOes6l7Ds/9c69a51705b4a3421d65d6403ec815b1/non_cheesy_stock_photos_cover-edit.jpg',
    )
    const [recieverLastSeen, setRecieverLastSeen] = useState('')
    const [disappearingMessageTime, setDisappearingMessageTime] = useState(0)

    function getTime() {
        const now = new Date()
        return String(now)
    }

    // connect user to socket, set user profile and reciever id
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

        // set reciever details
        setRecieverId(searchParams.get('id'))

        return () => {
            socket.off('connect')
            socket.off('disconnect')
        }
    }, [])

    useEffect(() => {
        socket.on('call-made', (data) => {
            if (user && data.to == user) {
                router.push(
                    '/video?createcall=FALSE&recieverid=' +
                        data.to +
                        '&meetingid=' +
                        data.meetingid +
                        '&senderid=' +
                        data.from,
                )
            }
        })
    }, [socket, user])
    useEffect(() => {
        socket.on('audio-call-made', (data) => {
            if (user && data.to == user) {
                router.push(
                    '/audio?createcall=FALSE&recieverid=' +
                        data.to +
                        '&meetingid=' +
                        data.meetingid +
                        '&senderid=' +
                        data.from,
                )
            }
        })
    }, [socket, user])

    // get messages from socket
    useEffect(() => {
        socket.on('message', (message) => {
            // get only those messages whose recieverid matches our user id
            console.log({ message })
            console.log({ user })
            console.log(message.recieverId == user)
            let messageList = []
            if (message.recieverId == user && message.sender == recieverId) {
                // if the message is sent by our message reciever to us, only then add it to the list
                console.log('recieved a message!')
                messageList.push(message)
            }
            setMessages((messages) => messages.concat(messageList))
        })
        return () => {
            socket.off('message')
        }
    }, [socket, messages, user])

    // log save messages into firebase.
    useEffect(() => {
        console.log(messages)
        console.log(user)
        if (user != '' && recieverId != '')
            setDoc(doc(db, 'messages', user + recieverId), {
                data: JSON.stringify(messages),
            })
    }, [messages])

    // get reciever name
    useEffect(() => {
        if (user != '') fetchUsers()
    }, [user])

    // get previous messages from firestore and set them in messages array
    useEffect(() => {
        if (user != '' && recieverId != '') {
            // get messages from firebase
            const docRef = doc(db, 'messages', user + recieverId)
            getDoc(docRef).then((docSnap) => {
                if (docSnap.exists()) {
                    console.log(docSnap.data().data)
                    setMessages(JSON.parse(docSnap.data().data))
                }
            })
        }
    }, [user, recieverId])

    // Function to download a text file with all the text messages
    const downloadTxtFile = () => {
        // Iterate through the messages array and find out the text strings and add them to a new array
        let textMessages = []
        const element = document.createElement('a')
        messages.forEach((message) => {
            if (typeof message.message === 'string') {
                textMessages.push({
                    message: message.message,
                    sender: message.sender == user ? userName : recieverName,
                    reciever:
                        message.reciever == user ? userName : recieverName,
                    time: message.time,
                })
            }
        })
        const file = new Blob([JSON.stringify(textMessages)], {
            type: 'text/plain',
        })
        element.href = URL.createObjectURL(file)
        element.download = `messages_${userName}_${recieverName}.txt`
        document.body.appendChild(element) // Required for this to work in FireFox
        element.click()
    }

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
        if (recieverId) {
            const userDocRef = doc(db, 'users', recieverId)
            getDoc(userDocRef)
                .then((docSnap) => {
                    if (docSnap.exists()) {
                        let milliseconds =
                            docSnap.data().lastSeen.seconds * 1000 +
                            docSnap.data().lastSeen.nanoseconds / 1e6
                        let time = new Date(milliseconds)
                        // console.log(time);
                        const hours = time.getHours()
                        const minutes = time.getMinutes()
                        const amOrPm = hours >= 12 ? 'PM' : 'AM'

                        // Convert to 12-hour format
                        const formattedHours = hours % 12 || 12

                        // Ensure the hours and minutes are displayed with leading zeros if needed
                        const formattedTime = `${String(
                            formattedHours,
                        ).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`

                        //   return `${formattedTime} ${amOrPm}`;
                        console.log(`${formattedTime} ${amOrPm}`)
                        setRecieverLastSeen(`${formattedTime} ${amOrPm}`)
                    }
                })
                .catch((error) => {
                    console.error('Error checking user document:', error)
                })
        }
        if (user) {
            const userDocRef = doc(db, 'users', user)
            getDoc(userDocRef)
                .then((docSnap) => {
                    if (docSnap.exists()) {
                        const userData = docSnap.data()
                        setDoc(doc(db, 'users', user), {
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
        }
    }, [messages])

    // find the reciever name, image
    const fetchUsers = async () => {
        try {
            const q = query(
                collection(db, 'users'),
                where('__name__', '!=', user),
            )
            const querySnapshot = await getDocs(q)
            querySnapshot.forEach((doc) => {
                const data = doc.data()
                if (doc.id === recieverId) {
                    setRecieverName(data.name)
                    setRecieverImg(data.imageUrl)
                }
            })
        } catch (error) {
            console.error('Error fetching users:', error)
        }
    }

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
                    recieverId,
                    time: getTime(),
                },
            ])
            socket.emit('new-message', {
                message: newMessage,
                sender: user,
                recieverId,
                time: getTime(),
            })
            setNewMessage('')
        } else if (typeof newMessage !== 'string') {
            console.log(newMessage)
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
            const storageRef = ref(storage, `chats/${user + recieverId + date}`)
            uploadBytes(storageRef, newMessage.url, metadata).then(
                (snapshot) => {
                    console.log('Uploaded a blob or file!')
                    getDownloadURL(storageRef)
                        .then((downloadURL) => {
                            console.log('File available at', downloadURL)
                            setMessages([
                                ...messages,
                                {
                                    message: {
                                        type: newMessage.type,
                                        url: downloadURL,
                                    },
                                    sender: user,
                                    recieverId,
                                    time: getTime(),
                                },
                            ])
                            socket.emit('new-message', {
                                message: {
                                    type: newMessage.type,
                                    url: downloadURL,
                                },
                                sender: user,
                                recieverId,
                                time: getTime(),
                            })
                        })
                        .catch((error) => {
                            // Handle any errors while getting the download URL
                            console.error('Error getting download URL:', error)
                        })
                },
            )
            console.log(newMessage)

            setNewMessage('')
        }
    }

    // Disappearing Message

    useEffect(() => {
        if (user && recieverId) {
            const userDocRef = doc(db, 'disappearing', user + recieverId)
            getDoc(userDocRef)
                .then((docSnap) => {
                    if (docSnap.exists()) {
                        const userData = docSnap.data()
                        setDoc(doc(db, 'disappearing', user + recieverId), {
                            user: user,
                            disappearingMessageTime: disappearingMessageTime,
                        })
                        setDoc(doc(db, 'disappearing', recieverId + user), {
                            user: user,
                            disappearingMessageTime: disappearingMessageTime,
                        })
                    }
                })
                .catch((error) => {
                    console.error('Error checking user document:', error)
                })
        }
    }, [disappearingMessageTime])

    useEffect(() => {
        if (user && recieverId) {
            console.log('enter', 'enter')
            const userDocRef = doc(db, 'disappearing', user + recieverId)
            getDoc(userDocRef).then((docSnap) => {
                if (docSnap.exists()) {
                    const userData = docSnap.data()
                    //   console.log('userData', userData)
                    setDisappearingMessageTime(userData.disappearingMessageTime)
                }
            })
        }
    }, [user, recieverId])

    // Create Meet
    const createMeet = () => {
        router.push(
            '/video?createcall=TRUE&recieverid=' +
                recieverId +
                '&senderid=' +
                user,
        )
    }
    const createCall = () => {
        router.push(
            '/audio?createcall=TRUE&recieverid=' +
                recieverId +
                '&senderid=' +
                user,
        )
    }

    return (
        <div className="flex flex-col h-screen overflow-y-hidden" ref={myRef}>
            {/* Top Bar */}
            <Chatbar
                name={recieverName}
                image={recieverImg}
                status={isConnected}
                downloadTxt={downloadTxtFile}
                lastSeen={recieverLastSeen}
                myRef={myRef}
                disappearingMessageTime={disappearingMessageTime}
                setDisappearingMessageTime={setDisappearingMessageTime}
                createMeet={createMeet}
                createCall={createCall}
            ></Chatbar>
            {/* Chat area */}
            <div className="flex pb-[10rem] bg-color-primary-500 dark:bg-color-surface-200 flex-col h-screen">
                <div
                    ref={chatContainerRef}
                    className="flex-1 p-4 overflow-y-auto"
                    id="scroll"
                >
                    <div className="flex flex-1 flex-col space-y-4 h-[100%]">
                        {messages.map((message, index) => (
                            <Chatbubble
                                key={index}
                                message={message}
                                index={index}
                                user={user}
                                disappearingMessageTime={
                                    disappearingMessageTime
                                }
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
        </div>
    )
}

export default ChatApp
