import { db } from './firebase'
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
// find the user detials from userid
export default async function fetchUser(id) {
    try {
        const q = query(collection(db, 'users'))
        const querySnapshot = await getDocs(q)
        querySnapshot.forEach((doc) => {
            const data = doc.data()
            if (doc.id === id) {
                return data.name
            }
        })
    } catch (error) {
        console.error('Error fetching users:', error)
    }
}
