'use client'
import React from 'react'
import { BsFillCameraVideoFill } from 'react-icons/bs'
import { BiSolidPhoneCall } from 'react-icons/bi'
import { AiFillFileText } from 'react-icons/ai'
import { TbMinusVertical } from 'react-icons/tb'
import { ImExit } from 'react-icons/im'
import { MdGroupRemove, MdGroupAdd } from 'react-icons/md'
import 'react-tooltip/dist/react-tooltip.css'
import { Tooltip } from 'react-tooltip'

const Chatbar = ({
    image,
    name,
    groupMembers,
    downloadTxt,
    lastSeen,
    addMember,
    removeMember,
    exitGroup,
}) => {
    return (
        <div className="bg-green-500 dark:bg-color-surface-100 p-4 flex justify-between items-center">
            <Tooltip id="exit-group" />
            <Tooltip id="remove-group" />
            <Tooltip id="add-group" />
            <Tooltip id="call-group" />
            <Tooltip id="video-group" />
            <Tooltip id="export-group" />
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
                        <p className="text-white">{groupMembers}</p>
                    </div>
                </div>
            </div>
            <div className="flex">
                <button
                    data-tooltip-id="exit-group"
                    data-tooltip-content="Exit Group"
                    className="ml-2 px-4 py-2 bg-transparent text-gray-200 text-2xl rounded-md"
                    onClick={exitGroup}
                >
                    <ImExit />
                </button>
                <button
                    data-tooltip-id="remove-group"
                    data-tooltip-content="Remove Participants"
                    className="ml-2 px-4 py-2 bg-transparent text-gray-200 text-2xl rounded-md"
                    onClick={removeMember}
                >
                    <MdGroupRemove />
                </button>
                <button
                    data-tooltip-id="add-group"
                    data-tooltip-content="Add Participants"
                    className="ml-2 px-4 py-2 bg-transparent text-gray-200 text-2xl rounded-md"
                    onClick={addMember}
                >
                    <MdGroupAdd />
                </button>
                <button
                    className=" py-2 bg-transparent text-gray-200 text-4xl rounded-md"
                    disabled
                >
                    <TbMinusVertical />
                </button>
                <button
                    data-tooltip-id="call-group"
                    data-tooltip-content="Audio Call"
                    className="ml-2 px-4 py-2 bg-transparent text-gray-200 text-2xl rounded-md"
                >
                    <BiSolidPhoneCall />
                </button>
                <button
                    data-tooltip-id="video-group"
                    data-tooltip-content="Video Call"
                    className="ml-2 px-4 py-2 bg-transparent text-gray-200 text-2xl rounded-md"
                >
                    <BsFillCameraVideoFill />
                </button>
                <button
                    className=" py-2 bg-transparent text-gray-200 text-4xl rounded-md"
                    disabled
                >
                    <TbMinusVertical />
                </button>
                <button
                    className="ml-2 px-4 py-2 bg-transparent text-gray-200 text-2xl rounded-md"
                    onClick={() => {
                        downloadTxt()
                    }}
                    data-tooltip-id="export-group"
                    data-tooltip-content="Export Chat"
                >
                    <AiFillFileText />
                </button>
            </div>
        </div>
    )
}

export default Chatbar
