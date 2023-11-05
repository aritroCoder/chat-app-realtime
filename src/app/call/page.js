'use client'
import { useEffect, useRef, useState } from 'react'
import { socket } from '../utils/socket'
import { useSearchParams } from 'next/navigation'
import Peer from 'simple-peer'
import { where } from 'firebase/firestore'
import Video from './Video'

const CallPage = () => {
    const [peers, setPeers] = useState([])
    const userVideo = useRef()
    const peersRef = useRef([])
    const searchParams = useSearchParams()
    const roomID = searchParams.get('id')

    useEffect(() => {
        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((stream) => {
                userVideo.current.srcObject = stream
                socket.emit('join room', roomID)
                socket.on('all users', (users) => {
                    console.log(users)
                    const peers = []
                    users.forEach((userID) => {
                        const peer = createPeer(userID, socket.id, stream)
                        peersRef.current.push({
                            peerID: userID,
                            peer,
                        })
                        peers.push(peer)
                    })
                    setPeers(peers)
                })
                socket.on('user joined', (payload) => {
                    const peer = addPeer(
                        payload.signal,
                        payload.callerID,
                        stream,
                    )
                    peersRef.current.push({
                        peerID: payload.callerID,
                        peer,
                    })
                    setPeers((users) => [...users, peer])
                })
                socket.on('receiving returned signal', (payload) => {
                    const item = peersRef.current.find(
                        (p) => p.peerID === payload.id,
                    )
                    item.peer.signal(payload.signal)
                })
            })
    }, [])

    function createPeer(userToSignal, callerID, stream) {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
        })
        peer.on('signal', (signal) => {
            socket.emit('sending signal', { userToSignal, callerID, signal })
        })
        return peer
    }

    function addPeer(incomingSignal, callerID, stream) {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
        })
        peer.on('signal', (signal) => {
            socket.emit('returning signal', { signal, callerID })
        })
        peer.signal(incomingSignal)
        return peer
    }
    return (
        <div>
            <video muted ref={userVideo} autoPlay playsInline />
            {peers.map((peer, index) => {
                return <Video key={index} peer={peer} />
            })}
        </div>
    )
}
export default CallPage
