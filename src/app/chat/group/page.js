'use client'
import React, { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { socket } from '../../utils/socket'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '../../utils/firebase'
import fetchUser from '../../utils/fetchuser'
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

import Chatbar from '../../components/chatpage/Chatbar'
import Chatbubble from '../../components/chatpage/Chatbubble'
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
    const [userImage, setUserImage] = useState(
        'https://images.ctfassets.net/hrltx12pl8hq/12wPNuS1sirO3hOes6l7Ds/9c69a51705b4a3421d65d6403ec815b1/non_cheesy_stock_photos_cover-edit.jpg',
    )
    const [groupId, setGroupId] = useState('')
    const [groupName, setGroupName] = useState('')
    const [groupImg, setGroupImg] = useState(
        'https://images.ctfassets.net/hrltx12pl8hq/12wPNuS1sirO3hOes6l7Ds/9c69a51705b4a3421d65d6403ec815b1/non_cheesy_stock_photos_cover-edit.jpg',
    )
    const [groupMembersId, setGroupMembersId] = useState([])
    const [groupMembers, setGroupMembers] = useState([])

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
        console.log(messages)
        console.log(user)
        if (groupId != '')
            setDoc(doc(db, 'messages', groupId), {
                data: JSON.stringify(messages),
            })
    }, [messages])

    // get messages from socket
    useEffect(() => {
        socket.on('message', (message) => {
            // get only those messages whose groupId matches our current group
            console.log({ message })
            let messageList = []
            if (message.groupId == groupId) {
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
                    console.log(docSnap.data().data)
                    setMessages(JSON.parse(docSnap.data().data))
                }
            })
        }
    }, [groupId])

    // Function to download a text file with all the text messages
    // TODO: update it for group
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
    }, [messages])

    // find the user detials from userid
    // const fetchUser = async (id) => {
    //     try {
    //         const q = query(
    //             collection(db, 'users'),
    //             where('__name__', '!=', user),
    //         )
    //         const querySnapshot = await getDocs(q)
    //         querySnapshot.forEach((doc) => {
    //             const data = doc.data()
    //             if (doc.id === id) {
    //                 return data.name
    //             }
    //         })
    //     } catch (error) {
    //         console.error('Error fetching users:', error)
    //     }
    // }

    // get group data from id
    const getGroupData = async (groupId) => {
        try {
            const querySnapshot = await getDocs(collection(db, 'groups'))
            querySnapshot.forEach((doc) => {
                if (doc.id == groupId) {
                    console.log(doc.data())
                    setGroupName(doc.data().name)
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
            groupMembersId.forEach((memberId) => {
                members.push(fetchUser(memberId))
            })
            setGroupMembers(members)
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
            const storageRef = ref(storage, `chats/${groupId + date}`)
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
            console.log(newMessage)

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

    return (
        <div className="flex flex-col h-screen overflow-y-hidden">
            {/* Top Bar */}
            <Chatbar
                name={groupName}
                image={groupImg}
                status={isConnected}
                downloadTxt={downloadTxtFile}
            ></Chatbar>
            <button onClick={() => addMember()}>add members</button>
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
