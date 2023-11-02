'use client'
import React from 'react'
import { BsFillCameraVideoFill } from 'react-icons/bs'
import { LuMoreVertical } from 'react-icons/lu'
import { BiSolidPhoneCall } from 'react-icons/bi'
import { AiFillFileText } from 'react-icons/ai'

const Chatbar = ({ image, name, groupMembers, downloadTxt, lastSeen }) => {
    return (
        <div className="bg-green-500 dark:bg-color-surface-100 p-4 flex justify-between items-center">
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
                        <p className="text-white">{groupMembers}</p>
                    </div>
                </div>
            </div>
            <div className="flex">
                <button className="ml-2 px-4 py-2 bg-transparent text-gray-200 text-2xl rounded-md">
                    <BiSolidPhoneCall />
                </button>
                <button className="ml-2 px-4 py-2 bg-transparent text-gray-200 text-2xl rounded-md">
                    <BsFillCameraVideoFill />
                </button>
                <button
                    className="ml-2 px-4 py-2 bg-transparent text-gray-200 text-2xl rounded-md"
                    onClick={() => {
                        downloadTxt()
                    }}
                >
                    <AiFillFileText />
                </button>
            </div>
        </div>
    )
}

export default Chatbar
