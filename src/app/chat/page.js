"use client";
import React, { useEffect, useState } from 'react';
import { socket } from '../utils/socket';

import { BsEmojiSmile, BsFillMicFill, BsFillCameraVideoFill } from 'react-icons/bs';
import { ImAttachment } from 'react-icons/im';
import { LuMoreVertical } from 'react-icons/lu';
import { BiSolidPhoneCall } from 'react-icons/bi';

const ChatApp = () => {
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [user, setUser] = useState('');

    useEffect(() => {
        let newUser = prompt('Enter your name');
        setUser(newUser);

        socket.on('connect', () => {
            setIsConnected(true);
        });

        socket.emit('new-user', newUser);

        socket.on('disconnect', () => {
            setIsConnected(false);
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

    const handleSendMessage = () => {
        if (newMessage.trim() !== '') {
            setMessages([...messages, { message: newMessage, sender: user }]);
            socket.emit('new-message', { message: newMessage, sender: user });
            setNewMessage('');
        }
    };

    return (
        <div className='flex flex-col h-screen'>
            {/* Top Bar */}
            <div className="bg-green-500 dark:bg-color-surface-100 p-4 flex justify-between items-center">
                <div className='flex items-center'>
                    <div class="w-12 h-12 mx-5">
                        <img class="rounded-full h-12 border-2 border-black dark:border-green-500" src="https://images.ctfassets.net/hrltx12pl8hq/12wPNuS1sirO3hOes6l7Ds/9c69a51705b4a3421d65d6403ec815b1/non_cheesy_stock_photos_cover-edit.jpg" alt="" />
                    </div>
                    <div className='flex flex-col'>
                        <h1 className="text-2xl font-semibold text-white">Person's Name</h1>
                        {/* connected symbol */}
                        <div className="flex items-center">
                            <div
                                className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'
                                    }`}
                            ></div>
                            <p className='text-white'>{isConnected ? 'Online' : 'Offline'}</p>
                        </div>
                    </div>
                </div>
                <div className='flex'>
                    <button
                        className="ml-2 px-4 py-2 bg-transparent text-gray-200 text-2xl rounded-md"
                    >
                        <BiSolidPhoneCall />
                    </button>
                    <button
                        className="ml-2 px-4 py-2 bg-transparent text-gray-200 text-2xl rounded-md"
                    >
                        <BsFillCameraVideoFill />
                    </button>
                    <button
                        className="ml-2 px-4 py-2 bg-transparent text-gray-200 text-2xl rounded-md"
                    >
                        <LuMoreVertical />
                    </button>
                </div>
            </div>
            {/* Chat area */}
            <div className="flex bg-color-primary-500 dark:bg-color-surface-200 flex-col h-screen">
                <div className="flex-1 p-4 overflow-y-auto">
                    <div className="space-y-4 h-[100%]">
                        {messages.map((message, index) => (
                            <>
                            <div
                                key={index}
                                className={`max-w-xs text-xl mx-2 rounded py-2 px-4 p-2 ${message.sender === user
                                        ? 'float-right bg-green-600 text-white dark:bg-color-surface-100 ml-auto'
                                        : 'clear-both float-left bg-green-400 text-gray-800 dark:bg-[#005C4B] dark:text-white mr-auto'
                                    }`}
                            >
                                {message.message}
                            </div>
                            <br/>
                            <br/>
                            <br/>
                            </>
                        ))}
                    </div>
                </div>


                <div className="bg-white dark:bg-color-surface-100 p-4 px-3">
                    <div className="flex">
                        <button
                            className="ml-2 mx-1 px-1 py-2 bg-transparent text-gray-700 dark:text-gray-200 text-2xl rounded-md"
                            onClick={handleSendMessage}
                        >
                            <BsEmojiSmile />
                        </button>
                        <button
                            className="ml-2 mx-3 px-1 py-2 bg-transparent text-gray-700 dark:text-gray-200 text-2xl rounded-md"
                            onClick={handleSendMessage}
                        >
                            <ImAttachment />
                        </button>
                        <input
                            type="text"
                            className="flex-1 p-2 rounded-md border-none focus:outline-none text-black dark:text-white bg-white dark:bg-color-surface-200"
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyUp={(e) => {
                                if (e.key === 'Enter') {
                                    handleSendMessage();
                                }
                            }}
                        />
                        <button
                            className="ml-2 px-4 py-2 bg-transparent text-gray-700 dark:text-gray-200 text-2xl rounded-md"
                        >
                            <BsFillMicFill />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatApp;