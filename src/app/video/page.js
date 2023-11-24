'use client'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { socket } from '../utils/socket'
import { MdCall, MdCallEnd } from 'react-icons/md'
import {
    MeetingProvider,
    useMeeting,
    useParticipant,
} from '@videosdk.live/react-sdk'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../utils/firebase'

import { authToken, createMeeting } from '../utils/api'
import ReactPlayer from 'react-player'
import { BiCamera, BiCameraOff } from 'react-icons/bi'
import {
    BsMic,
    BsMicMute,
    BsFillMicFill,
    BsFillCameraVideoFill,
} from 'react-icons/bs'
import { PiSignOutBold } from 'react-icons/pi'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, storage } from '../utils/firebase'
import { FaCopy } from 'react-icons/fa'
// import { ToastContainer, toast } from 'react-toastify'

// import 'react-toastify/dist/ReactToastify.css'

function JoinScreen({ getMeetingAndToken, meetingid = null }) {
    const [meetingId, setMeetingId] = useState(meetingid)
    const onClick = async () => {
        await getMeetingAndToken(meetingId)
    }
}

function ParticipantView(props) {
    const micRef = useRef(null)
    const { webcamStream, micStream, webcamOn, micOn, isLocal, displayName } =
        useParticipant(props.participantId)

    const videoStream = useMemo(() => {
        if (webcamOn && webcamStream) {
            const mediaStream = new MediaStream()
            mediaStream.addTrack(webcamStream.track)
            return mediaStream
        }
    }, [webcamStream, webcamOn])

    useEffect(() => {
        if (micRef.current) {
            if (micOn && micStream) {
                const mediaStream = new MediaStream()
                mediaStream.addTrack(micStream.track)

                micRef.current.srcObject = mediaStream
                micRef.current
                    .play()
                    .catch((error) =>
                        console.error('videoElem.current.play() failed', error),
                    )
            } else {
                micRef.current.srcObject = null
            }
        }
    }, [micStream, micOn])

    return (
        <div className="w-[42%] min-w-[400px] m-5">
            <p className="text-black dark:text-white text-xl inline-flex">
                Participant: {displayName} |
                {webcamOn ? <BiCamera size={25} /> : <BiCameraOff size={25} />}{' '}
                |{micOn ? <BsMic size={25} /> : <BsMicMute size={25} />}
            </p>
            {!webcamOn && (
                <div className="w-[100%] h-[94%] mt-[10px] bg-black flex items-center justify-center">
                    <p className="text-white text-9xl">
                        {displayName.charAt(0)}
                    </p>
                </div>
            )}
            <audio ref={micRef} autoPlay playsInline muted={isLocal} />
            {webcamOn && (
                <ReactPlayer
                    //
                    playsinline // very very imp prop
                    pip={false}
                    light={false}
                    controls={false}
                    muted={true}
                    playing={true}
                    //
                    url={videoStream}
                    //
                    height={'100%'}
                    width={'100%'}
                    onError={(err) => {
                        console.log(err, 'participant video error')
                    }}
                />
            )}
        </div>
    )
}

function Controls() {
    const { leave, toggleMic, toggleWebcam } = useMeeting()
    return (
        <div className="flex absolute bottom-0">
            <button
                className="w-20 h-20 flex items-center justify-center rounded-full bg-red-500 text-gray-100 font-bold p-2 m-2"
                onClick={() => leave()}
            >
                <PiSignOutBold size={25} />
            </button>
            <button
                className="w-20 h-20 flex items-center justify-center rounded-full bg-red-500 text-gray-100 font-bold p-2 m-2"
                onClick={() => toggleMic()}
            >
                <BsFillMicFill size={25} />
            </button>
            <button
                className="w-20 h-20 flex items-center justify-center rounded-full bg-red-500 text-gray-100 font-bold p-2 m-2"
                onClick={() => toggleWebcam()}
            >
                <BsFillCameraVideoFill size={25} />
            </button>
        </div>
    )
}

function MeetingView(props) {
    const [joined, setJoined] = useState(null)
    //Get the method which will be used to join the meeting.
    //We will also get the participants list to display all participants
    const { join, participants } = useMeeting({
        //callback for when meeting is joined successfully
        onMeetingJoined: () => {
            setJoined('JOINED')
        },
        //callback for when meeting is left
        onMeetingLeft: () => {
            props.onMeetingLeave()
        },
    })
    const joinMeeting = () => {
        setJoined('JOINING')
        join()
    }

    return (
        <div className="w-full h-screen bg-color-primary-200 dark:bg-color-surface-100 flex content-center items-center justify-center flex-col">
            <h3 className="my-8 text-5xl text-black dark:text-white">
                Video Call
            </h3>
            {/* {console.log('props.group', props)} */}
            {props.isGroup && (
                <div className="text-black dark:text-white text-xl">
                    {' '}
                    Meeting Id:
                    {props.meetingId}{' '}
                    {/* FaCopy button to copy the URL to the clipboard on click */}
                    <button
                        className="p-2 bg-color-surface-300 dark:bg-color-primary-200 rounded-lg text-white dark:text-amber-950"
                        onClick={() => {
                            navigator.clipboard.writeText(
                                `http://localhost:3000/video?group=TRUE&&meetingid=${props.meetingId}`,
                            )
                        }}
                    >
                        Copy Link{' '}
                        <FaCopy className="cursor-pointer inline-block" />
                    </button>
                </div>
            )}
            {joined && joined == 'JOINED' ? (
                <>
                    <div className="flex flex-wrap justify-evenly">
                        {[...participants.keys()].map((participantId) => (
                            <ParticipantView
                                participantId={participantId}
                                key={participantId}
                            />
                        ))}
                    </div>
                    <Controls />
                </>
            ) : joined && joined == 'JOINING' ? (
                <p className="text-black dark:text-white">
                    Joining the meeting...
                </p>
            ) : (
                <>
                    <div className="w-64 h-64 rounded-full border-green-500 border-4 my-5 flex items-center justify-center">
                        <img
                            className="w-60 h-60 rounded-full"
                            src={props.recieverImg}
                            alt=""
                        />
                    </div>
                    <div className="flex gap-16">
                        <button
                            className="rounded-full w-20 h-20 p-2 bg-green-500 text-gray-100 flex items-center justify-center"
                            onClick={joinMeeting}
                        >
                            {/* Join */}
                            <MdCall size={50} />
                        </button>
                        <button
                            className="rounded-full w-20 h-20 p-2 bg-red-500 text-gray-100 flex items-center justify-center"
                            onClick={props.onMeetingLeave}
                        >
                            <MdCallEnd size={50} />
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}

function App() {
    const searchParams = useSearchParams()
    const [meetingId, setMeetingId] = useState(null)
    const [recieverName, setRecieverName] = useState(null)
    const [recieverImg, setRecieverImg] = useState(null)
    const [docRef, setDocRef] = useState('')
    const Router = useRouter()
    const { push } = useRouter()
    useEffect(() => {
        let createcall = searchParams.get('createcall')
        if (createcall == 'TRUE') {
            getMeetingAndToken(null)
        } else if (createcall == 'FALSE') {
            getMeetingAndToken(searchParams.get('meetingid'))
        }
        if (searchParams.get('meetingid')) {
            setMeetingId(searchParams.get('meetingid'))
            // Set the reciever's name from the firebase authentication
            onAuthStateChanged(auth, async (user) => {
                if (user) {
                    try {
                        // Retrieve user data from Firestore based on the user's UID
                        // setUserUid(user.uid)
                        const userDocRef = doc(db, 'users', user.uid)
                        setDocRef(userDocRef)
                        const userDocSnapshot = await getDoc(userDocRef)

                        if (userDocSnapshot.exists()) {
                            const userData = userDocSnapshot.data()
                            console.log('userData', userData)
                            setRecieverName(userData.name || '')
                            setRecieverImg(userData.imageUrl || '')
                        }
                    } catch (error) {
                        console.error('Error fetching user data:', error)
                    }
                } else {
                    alert('Please login to continue')
                    push('/')
                }
            })
        }
        if (searchParams.get('group')) {
            onAuthStateChanged(auth, async (user) => {
                if (user) {
                    try {
                        // Retrieve user data from Firestore based on the user's UID
                        // setUserUid(user.uid)
                        const userDocRef = doc(db, 'users', user.uid)
                        setDocRef(userDocRef)
                        const userDocSnapshot = await getDoc(userDocRef)

                        if (userDocSnapshot.exists()) {
                            const userData = userDocSnapshot.data()
                            console.log('userData', userData)
                            setRecieverName(userData.name || '')
                            setRecieverImg(userData.imageUrl || '')
                        }
                    } catch (error) {
                        console.error('Error fetching user data:', error)
                    }
                } else {
                    alert('Please login to continue')
                    push('/')
                }
            })
        }
    }, [])

    useEffect(() => {
        if (meetingId && !searchParams.get('group')) {
            socket.emit('call-user', {
                from: searchParams.get('senderid'),
                to: searchParams.get('recieverid'),
                meetingid: meetingId,
            })
            let createcall = searchParams.get('createcall')
            if (createcall == 'TRUE') {
                // Get the reciever's name from the firestore
                const userDocRef = doc(
                    db,
                    'users',
                    searchParams.get('senderid'),
                )
                getDoc(userDocRef).then((docSnap) => {
                    if (docSnap.exists()) {
                        const userData = docSnap.data()
                        console.log('userData', userData)
                        setRecieverName(userData.name)
                        setRecieverImg(userData.imageUrl)
                    }
                })
            } else {
                const userDocRef = doc(
                    db,
                    'users',
                    searchParams.get('recieverid'),
                )
                getDoc(userDocRef).then((docSnap) => {
                    if (docSnap.exists()) {
                        const userData = docSnap.data()
                        console.log('userData', userData)
                        setRecieverName(userData.name)
                        setRecieverImg(userData.imageUrl)
                    }
                })
            }
        }
    }, [meetingId])

    //Getting the meeting id by calling the api we just wrote
    const getMeetingAndToken = async (id) => {
        const meetingId =
            id == null ? await createMeeting({ token: authToken }) : id
        setMeetingId(meetingId)
    }

    //This will set Meeting Id to null when meeting is left or ended
    const onMeetingLeave = () => {
        setMeetingId(null)
        Router.back()
    }
    const onMeetingLeaveGroup = () => {
        setMeetingId(null)
        window.close()
    }

    if (searchParams.get('meetingid')) {
        return authToken && meetingId ? (
            <>
                <MeetingProvider
                    config={{
                        meetingId,
                        micEnabled: true,
                        webcamEnabled: true,
                        name: recieverName,
                    }}
                    token={authToken}
                >
                    <MeetingView
                        meetingId={meetingId}
                        onMeetingLeave={onMeetingLeave}
                        recieverImg={recieverImg}
                        isGroup={searchParams.get('group') ? true : false}
                    />
                </MeetingProvider>
                {/* show call id */}
                {/* <div>
                    {' '}
                    Call Id: {meetingId}, url:
                    http://localhost:3000/video?group=TRUE&&meetingid=
                    {meetingId}{' '}
                </div> */}
            </>
        ) : (
            <>
                <JoinScreen
                    getMeetingAndToken={getMeetingAndToken}
                    meetingid={searchParams.get('meetingid')}
                />
            </>
        )
    }

    return authToken &&
        meetingId &&
        (recieverName || searchParams.get('group')) ? (
        <>
            <MeetingProvider
                config={{
                    meetingId,
                    micEnabled: true,
                    webcamEnabled: true,
                    name: recieverName,
                }}
                token={authToken}
            >
                <MeetingView
                    meetingId={meetingId}
                    onMeetingLeave={
                        searchParams.get('group')
                            ? onMeetingLeaveGroup
                            : onMeetingLeave
                    }
                    recieverImg={recieverImg}
                    isGroup={searchParams.get('group') ? true : false}
                />
            </MeetingProvider>
            {/* show call id */}
            {/* <div>
                {' '}
                Call Id: {meetingId}, url:
                http://localhost:3000/video?group=TRUE&&meetingid={meetingId}{' '}
            </div> */}
        </>
    ) : (
        <>
            <JoinScreen getMeetingAndToken={getMeetingAndToken} />
        </>
    )
}

export default App
