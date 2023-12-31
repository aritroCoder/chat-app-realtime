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
import { BsMic, BsMicMute, BsFillMicFill } from 'react-icons/bs'
import { PiSignOutBold } from 'react-icons/pi'

function JoinScreen({ getMeetingAndToken }) {
    const [meetingId, setMeetingId] = useState(null)
    const onClick = async () => {
        await getMeetingAndToken(meetingId)
    }
}

function ParticipantView(props) {
    const micRef = useRef(null)
    const { webcamStream, micStream, webcamOn, micOn, isLocal, displayName } =
        useParticipant(props.participantId)

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
                Participant: {displayName}|
                {micOn ? <BsMic size={25} /> : <BsMicMute size={25} />}
            </p>

            <div className="w-[100%] h-[94%] mt-[10px] bg-black flex items-center justify-center">
                <p className="text-white text-9xl">
                    <img
                        className="w-[100%] h-[100%] rounded-full"
                        src={props.recieverImg}
                        alt=""
                    />
                </p>
            </div>

            <audio ref={micRef} autoPlay playsInline muted={isLocal} />
        </div>
    )
}

function Controls() {
    const { leave, toggleMic } = useMeeting()
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
                Voice Call
            </h3>
            {joined && joined == 'JOINED' ? (
                <>
                    <div className="flex flex-wrap justify-evenly">
                        {[...participants.keys()].map((participantId) => (
                            <ParticipantView
                                participantId={participantId}
                                key={participantId}
                                recieverImg={props.recieverImg}
                            />
                        ))}
                    </div>
                    <Controls />
                </>
            ) : joined && joined == 'JOINING' ? (
                <p className="text-black dark:text-white">
                    Joining the call...
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
    const Router = useRouter()
    useEffect(() => {
        let createcall = searchParams.get('createcall')
        if (createcall == 'TRUE') {
            getMeetingAndToken(null)
        } else if (createcall == 'FALSE') {
            getMeetingAndToken(searchParams.get('meetingid'))
        }
    }, [])

    useEffect(() => {
        //   console.log('meetingId', meetingId)
        if (meetingId) {
            socket.emit('audio-call-user', {
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
            // console.log(recieverName)
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

    return authToken && meetingId && recieverName && recieverImg ? (
        <MeetingProvider
            config={{
                meetingId,
                micEnabled: true,
                webcamEnabled: false,
                name: recieverName,
            }}
            token={authToken}
        >
            <MeetingView
                meetingId={meetingId}
                onMeetingLeave={onMeetingLeave}
                recieverImg={recieverImg}
            />
        </MeetingProvider>
    ) : (
        <>
            <JoinScreen getMeetingAndToken={getMeetingAndToken} />
        </>
    )
}

export default App
