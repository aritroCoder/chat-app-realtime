"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { socket } from '../utils/socket';
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../utils/firebase";
import { collection, query, where, doc, setDoc, addDoc, getDoc, getDocs } from "firebase/firestore";


import Chatbar from '../components/chatpage/Chatbar';
import Chatbubble from '../components/chatpage/Chatbubble';
import Chatinput from '../components/chatpage/Chatinput';

const ChatApp = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [user, setUser] = useState('');
    const [userName, setUserName] = useState('UserName')
    const [userImage, setUserImage] = useState("https://images.ctfassets.net/hrltx12pl8hq/12wPNuS1sirO3hOes6l7Ds/9c69a51705b4a3421d65d6403ec815b1/non_cheesy_stock_photos_cover-edit.jpg")
    const [recieverId, setRecieverId] = useState('');
    const [recieverName, setRecieverName] = useState('')
    const [recieverImg, setRecieverImg] = useState('https://images.ctfassets.net/hrltx12pl8hq/12wPNuS1sirO3hOes6l7Ds/9c69a51705b4a3421d65d6403ec815b1/non_cheesy_stock_photos_cover-edit.jpg')

    // connect user to socket, set user profile and reciever id
    useEffect(() => {
        socket.on('connect', () => {
            if(socket.recovered){
                console.log('Recovered connection');
                
            }
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
                router.push('/');
            }
        });

        // set reciever details
        setRecieverId(searchParams.get('id'))


        return () => {
            socket.off('connect');
            socket.off('disconnect');
        };
    }, []);

    // get messages from socket
    useEffect(() => {
        socket.on('message', (message) => {
            // get only those messages whose recieverid matches our user id
            console.log({message})
            console.log({user})
            console.log(message.recieverId == user)
            let messageList = []
            if (message.recieverId == user && message.sender == recieverId){ // if the message is sent by our message reciever to us, only then add it to the list
                console.log("recieved a message!")
                messageList.push(message)
            }
            setMessages((messages) => messages.concat(messageList));
        });
        return () => {
            socket.off('message');
        };
    }, [socket, messages, user]);

    // log messages and user. debug only
    useEffect(() => {
        console.log(messages)
        console.log(user)
        if(user != '' && recieverId != '')
          setDoc(doc(db, "messages", user + recieverId), { data: JSON.stringify(messages) })
    }, [messages]);

    // get reciever name
    useEffect(() => {
        if(user != "") fetchUsers();
    }, [user]);

    useEffect(() => {
      if(user != '' && recieverId != ''){
        // get messages from firebase
        const docRef = doc(db, "messages", user + recieverId)
        getDoc(docRef).then((docSnap)=>{
          if(docSnap.exists()){
            console.log(docSnap.data().data)
            setMessages(JSON.parse(docSnap.data().data))
          }
        })
      }
    }, [user, recieverId])

    // get current time
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

    // find the reciever name, image
    const fetchUsers = async () => {
      try {
        const q = query(
          collection(db, "users"),
          where("__name__", "!=", user)
        );
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if(doc.id === recieverId){
            setRecieverName(data.name);
            setRecieverImg(data.imageUrl);
          }
        });
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    // send message to socket
    const handleSendMessage = () => {
        if (typeof newMessage === 'string' && !newMessage.startsWith('blob:') && newMessage.trim() !== '') {
            setMessages([...messages, { message: newMessage, sender: user, recieverId, time: getCurrentTime() }]);
            socket.emit('new-message', { message: newMessage, sender: user, recieverId, time: getCurrentTime() });
            setNewMessage('');
        }
        else if (typeof newMessage !== 'string'){
            setMessages([...messages, { message: newMessage, sender: user, recieverId, time: getCurrentTime() }]);
            socket.emit('new-message', { message: newMessage, sender: user, recieverId, time: getCurrentTime() });
            setNewMessage('');
        }
    };

    return (
        <div className='flex flex-col h-screen overflow-y-hidden'>
            {/* Top Bar */}
            <Chatbar name={recieverName} image={recieverImg} status={isConnected}></Chatbar>
            {/* Chat area */}
            <div className="flex pb-[10rem] bg-color-primary-500 dark:bg-color-surface-200 flex-col h-screen">
                <div className="flex-1 p-4 overflow-y-auto">
                    <div className="flex flex-1 flex-col space-y-4 h-[100%]">
                        {messages.map((message, index) => (
                            <Chatbubble key={index} message={message} index={index} user={user}></Chatbubble>
                        ))}
                    </div>
                </div>
                <Chatinput setNewMessage={setNewMessage} newMessage={newMessage} handleSendMessage={handleSendMessage}></Chatinput>
            </div>
        </div>
    );
};

export default ChatApp;
