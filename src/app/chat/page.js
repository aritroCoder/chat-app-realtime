"use client";
import React, { useEffect, useState } from 'react';
import { socket } from '../utils/socket';

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
    }, [messages]);

    const handleSendMessage = () => {
        if (newMessage.trim() !== '') {
            setMessages([...messages, { message: newMessage, sender: user }]);
            socket.emit('new-message', {message: newMessage, sender: user});
            setNewMessage('');
        }
    };

    return (
        <div className="flex flex-col h-screen">
            <div className="bg-gray-200 p-4 mb-4">
                <h1 className="text-2xl font-semibold">Chat App</h1>
                {/* connected symbol */}
                <div className="flex items-center">
                    <div
                        className={`w-2 h-2 rounded-full mr-2 ${
                            isConnected ? 'bg-green-500' : 'bg-red-500'
                            }`}
                    ></div>
                    <p>{isConnected ? 'Connected' : 'Disconnected'}</p>
                </div>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`${index % 2 === 0 ? 'bg-blue-100' : 'bg-green-100'
                                } p-2 rounded-md`}
                        >
                            {message.sender} : {message.message}
                        </div>
                    ))}
                </div>
            </div>
            <div className="bg-gray-200 p-4">
                <div className="flex">
                    <input
                        type="text"
                        className="flex-1 p-2 rounded-md border"
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button
                        className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md"
                        onClick={handleSendMessage}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatApp;
