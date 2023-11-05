'use client'
import React from 'react'
import { BsFillCameraVideoFill } from 'react-icons/bs'
import { BiSolidPhoneCall } from 'react-icons/bi'
import { AiFillFileText } from 'react-icons/ai'
import 'react-tooltip/dist/react-tooltip.css'
import { Tooltip } from 'react-tooltip'

const Chatbar = ({
    image,
    name,
    status,
    downloadTxt,
    lastSeen,
    callHandler,
}) => {
    return (
        <div className="bg-green-500 dark:bg-color-surface-100 p-4 flex justify-between items-center">
            <Tooltip id="call" />
            <Tooltip id="video" />
            <Tooltip id="export" />
            <div className="flex items-center">
                <div className="w-12 h-12 mx-5">
                    <img
                        className="rounded-full h-12 border-2 border-black dark:border-green-500"
                        src={image}
                        alt=""
                    />
                </div>
                <div className="flex flex-col">
                    <h1 className="text-2xl font-semibold text-white">
                        {name}
                    </h1>
                    {/* connected symbol */}
                    <div className="flex items-center">
                        {/* <div
                          className={`w-2 h-2 rounded-full mr-2 ${status ? 'bg-green-500' : 'bg-red-500'}`}
                      ></div> */}

                        {/* <p className='text-white'>{status ? 'Online' : 'Offline'}</p> */}
                        <p className="text-white">Last seen {lastSeen}</p>
                    </div>
                </div>
            </div>
            <div className="flex">
                <button
                    data-tooltip-id="call"
                    data-tooltip-content="Audio Call"
                    className="ml-2 px-4 py-2 bg-transparent text-gray-200 text-2xl rounded-md"
                >
                    <BiSolidPhoneCall />
                </button>
                <button
                    data-tooltip-id="video"
                    data-tooltip-content="Video Call"
                    className="ml-2 px-4 py-2 bg-transparent text-gray-200 text-2xl rounded-md"
                    onClick={() => callHandler()}
                >
                    <BsFillCameraVideoFill />
                </button>
                <button
                    className="ml-2 px-4 py-2 bg-transparent text-gray-200 text-2xl rounded-md"
                    onClick={() => {
                        downloadTxt()
                    }}
                    data-tooltip-id="export"
                    data-tooltip-content="Export Chat"
                >
                    <AiFillFileText />
                </button>
            </div>
        </div>
    )
}

export default Chatbar
