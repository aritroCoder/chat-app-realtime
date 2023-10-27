"use client"
import React, {useState, useEffect} from 'react'
import Chatlistbar from '../components/chatpage/Chatlistbar'
import { auth, db } from '../utils/firebase';
import { useRouter } from 'next/navigation';
import { collection, query, where, doc, getDoc, getDocs } from "firebase/firestore";

const chatlist = () => {
    const { push } = useRouter();
    const [user, setUser] = useState('')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [image, setImage] = useState('')
    const [people, setPeople] = useState('')

    const fetchUsers = async (user) => {
        try {
            const q = query(collection(db, "users"), where("__name__", "!=", user.uid));
            const querySnapshot = await getDocs(q);
            let userList = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const id = doc.id;
                userList.push({ id, ...data });
            });
            setPeople(userList);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };
    useEffect(() => {
        auth.onAuthStateChanged((user) => {
            if (user) {
                setUser(user)
                const userDocRef = doc(db, 'users', user.uid);
                getDoc(userDocRef)
                    .then((docSnap) => {
                        if (docSnap.exists()) {
                            const userData = docSnap.data();
                            setName(userData.name || '');
                            setEmail(userData.email || '');
                            setImage(userData.imageUrl || '');
                        }
                    })
                    .catch((error) => {
                        console.error("Error checking user document:", error);
                    });
                fetchUsers(user);
            } else {
                alert('Please login to continue');
                push('/');
            }
        });
    }, [])
    
    
    const handleLogout = ()=>{
        // Logout the user and push it to the home page
        auth.signOut().then(() => {
            console.log("User logged out successfully!");
            // Redirect to the home page
            push('/')
        }).catch((error) => {
            console.error("Error logging out:", error);
        });
    }
    return (
        <>
            <Chatlistbar name={name} image={image} email={email} handleLogout={handleLogout} />
            <div className="h-full min-h-screen w-full py-4 bg-color-primary-300 dark:bg-color-surface-100 flex flex-col items-center " >
                {people && people.map((person) => (
                    <div className='w-[95%] overflow-x-hidden rounded-xl py-3 my-4 bg-color-primary-600 dark:bg-color-surface-300'>
                        <div className='flex items-center'>
                            <div className="w-12 h-12 mx-5">
                                <img className="rounded-full h-12 border-2 border-black dark:border-green-500" src={person.imageUrl} alt="" />
                            </div>
                            <div className='flex flex-col'>
                                <h1 className="text-2xl font-semibold text-white">{person.name}</h1>
                                <h1 className="text-lg text-white">{person.email}</h1>

                            </div>
                        </div>
                    </div>
                ))}
                
            </div>
        </>
    )
}

export default chatlist
