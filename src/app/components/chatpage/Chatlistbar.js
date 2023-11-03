'use client'
import React from 'react'
import { BiLogOut, BiSolidGroup } from 'react-icons/bi'
import { CgProfile } from 'react-icons/cg'
import { useRouter } from 'next/navigation'
import 'react-tooltip/dist/react-tooltip.css'
import { Tooltip } from 'react-tooltip'

const Chatlistbar = ({ image, name, email, handleLogout, onOpenModal }) => {
    const { push } = useRouter()
    return (
        <div className="bg-green-500 dark:bg-color-surface-100 p-4 flex justify-between items-center">
            <Tooltip id="group" />
            <Tooltip id="profile" />
            <Tooltip id="logout" />
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
                    <h1 className="text-lg text-white">{email}</h1>
                </div>
            </div>
            <div className="flex">
                <button
                    className="ml-2 px-4 py-2 bg-transparent text-gray-200 text-2xl rounded-md"
                    onClick={onOpenModal}
                    data-tooltip-id="group"
                    data-tooltip-content="Create Group"
                >
                    <BiSolidGroup />
                </button>
                <button
                    className="ml-2 px-4 py-2 bg-transparent text-gray-200 text-2xl rounded-md"
                    onClick={() => {
                        push('/profile')
                    }}
                    data-tooltip-id="profile"
                    data-tooltip-content="Profile"
                >
                    <CgProfile />
                </button>
                <button
                    className="ml-2 px-4 py-2 bg-transparent text-gray-200 text-2xl rounded-md"
                    onClick={handleLogout}
                    data-tooltip-id="logout"
                    data-tooltip-content="Logout"
                >
                    <BiLogOut />
                </button>
            </div>
        </div>
    )
}

export default Chatlistbar
