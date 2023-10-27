"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { socket } from '../utils/socket';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from '../utils/firebase';


import Chatbar from '../components/chatpage/Chatbar';
import Chatbubble from '../components/chatpage/Chatbubble';
import Chatinput from '../components/chatpage/Chatinput';

const ChatApp = () => {
    const { push } = useRouter();
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [user, setUser] = useState('');
    const [userName, setUserName] = useState('UserName')
    const [userImage, setUserImage] = useState("https://images.ctfassets.net/hrltx12pl8hq/12wPNuS1sirO3hOes6l7Ds/9c69a51705b4a3421d65d6403ec815b1/non_cheesy_stock_photos_cover-edit.jpg")

    useEffect(() => {
        socket.on('connect', () => {
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
        });
        onAuthStateChanged(auth, (user) => {
            if (user) {
                
                setUser(user.uid);
                setUserName(user.displayName);
                setUserImage(user.photoURL);
                socket.emit('new-user', user.uid);
                console.log("logged in as: ", user.uid)
            } else {
                alert('Please login to continue');
                push('/');
            }
        });
        return () => {
            socket.off('connect');
            socket.off('disconnect');
        };
    }, []);

    useEffect(() => {
        socket.on('message', (message) => {
            setMessages(([...messages, message]));
        });
        return () => {
            socket.off('message');
        };
    }, [socket, messages]);

    useEffect(() => {
        console.log(messages)
        console.log(user)
    }, [messages]);

    function getCurrentTime() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const amOrPm = hours >= 12 ? 'PM' : 'AM';

        // Convert to 12-hour format
        const formattedHours = hours % 12 || 12;

        // Ensure the hours and minutes are displayed with leading zeros if needed
        const formattedTime = `${String(formattedHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

        return `${formattedTime} ${amOrPm}`;
    }

    const handleSendMessage = () => {
        if (typeof newMessage === 'string' && !newMessage.startsWith('blob:') && newMessage.trim() !== '') {
            setMessages([...messages, { message: newMessage, sender: user, time: getCurrentTime() }]);
            socket.emit('new-message', { message: newMessage, sender: user, time: getCurrentTime() });
            setNewMessage('');
        }
        else if (typeof newMessage !== 'string'){
            setMessages([...messages, { message: newMessage, sender: user, time: getCurrentTime() }]);
            socket.emit('new-message', { message: newMessage, sender: user, time: getCurrentTime() });
            setNewMessage('');
        }
    };

    return (
        <div className='flex flex-col h-screen overflow-y-hidden'>
            {/* Top Bar */}
            <Chatbar name={userName} image={userImage} status={isConnected}></Chatbar>
            {/* Chat area */}
            <div className="flex pb-[10rem] bg-color-primary-500 dark:bg-color-surface-200 flex-col h-screen">
                <div className="flex-1 p-4 overflow-y-auto">
                    <div className="flex flex-1 flex-col space-y-4 h-[100%]">
                        {messages.map((message, index) => (
                            <Chatbubble message={message} index={index} user={user}></Chatbubble>
                        ))}
                    </div>
                </div>
                <Chatinput setNewMessage={setNewMessage} newMessage={newMessage} handleSendMessage={handleSendMessage}></Chatinput>
            </div>
        </div>
    );
};

export default ChatApp;