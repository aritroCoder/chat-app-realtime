import React, { useState } from 'react'
import { BsFillCameraVideoFill } from 'react-icons/bs'
import { BiSolidPhoneCall } from 'react-icons/bi'
import { AiFillFileText } from 'react-icons/ai'
import { PiClockCountdownFill } from 'react-icons/pi'
import 'react-tooltip/dist/react-tooltip.css'
import { Tooltip } from 'react-tooltip'
import 'react-responsive-modal/styles.css'
import { Modal } from 'react-responsive-modal'

const Chatbar = ({
    image,
    name,
    status,
    downloadTxt,
    lastSeen,
    myRef,
    disappearingMessageTime,
    setDisappearingMessageTime,
    createMeet,
}) => {
    const [open, setOpen] = useState(false)
    // const [disappearingMessageTime, setDisappearingMessageTime] = useState(0) // Default to 0 minutes

    const onOpenModal = () => {
        setOpen(true)
    }

    const onCloseModal = () => {
        setOpen(false)
    }

    const handleTimeSelection = (time) => {
        setDisappearingMessageTime(time)
        onCloseModal()
    }

    return (
        <div className="bg-green-500 dark:bg-color-surface-100 p-4 flex justify-between items-center">
            <Tooltip id="call" />
            <Tooltip id="video" />
            <Tooltip id="export" />
            <Tooltip id="disappear" />
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
                    <p className="text-white">Last seen {lastSeen}</p>
                </div>
            </div>
            <div className="flex">
                <button
                    data-tooltip-id="disappear"
                    data-tooltip-content="Disappearing Messages"
                    className="ml-2 px-4 py-2 bg-transparent text-gray-200 text-2xl rounded-md"
                    onClick={onOpenModal}
                >
                    <PiClockCountdownFill />
                </button>
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
                    onClick={createMeet}
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
            <Modal
                open={open}
                onClose={onCloseModal}
                container={myRef.current}
                classNames={{
                    modal: 'dissapearing-modal',
                }}
                center
            >
                <h2 className="text-2xl font-semibold mb-4 text-white">
                    Disappearing Message
                </h2>
                <h3 className="text-xl font-semibold mb-4 text-white">
                    Choose the duration for disappearing message
                </h3>
                <div className="disappearing-options">
                    <div class="inline-flex items-center">
                        <label
                            class="relative flex cursor-pointer items-center rounded-full p-3"
                            for="html"
                            data-ripple-dark="true"
                        >
                            <input
                                id="html"
                                name="type"
                                type="radio"
                                class="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-full border border-blue-gray-200 text-pink-500 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-pink-500 checked:before:bg-pink-500 hover:before:opacity-10"
                                value="0"
                                checked={disappearingMessageTime === 0}
                                onChange={() => handleTimeSelection(0)}
                            />
                            <div class="pointer-events-none absolute top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 text-pink-500 opacity-0 transition-opacity peer-checked:opacity-100">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="h-3.5 w-3.5"
                                    viewBox="0 0 16 16"
                                    fill="currentColor"
                                >
                                    <circle
                                        data-name="ellipse"
                                        cx="8"
                                        cy="8"
                                        r="8"
                                    ></circle>
                                </svg>
                            </div>
                        </label>
                        <label
                            class="mt-px cursor-pointer select-none text-white"
                            for="html"
                        >
                            OFF
                        </label>
                    </div>
                    <div class="inline-flex items-center">
                        <label
                            class="relative flex cursor-pointer items-center rounded-full p-3"
                            for="html"
                            data-ripple-dark="true"
                        >
                            <input
                                id="html"
                                name="type"
                                type="radio"
                                class="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-full border border-blue-gray-200 text-pink-500 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-pink-500 checked:before:bg-pink-500 hover:before:opacity-10"
                                value="5"
                                checked={disappearingMessageTime === 5}
                                onChange={() => handleTimeSelection(5)}
                            />
                            <div class="pointer-events-none absolute top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 text-pink-500 opacity-0 transition-opacity peer-checked:opacity-100">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="h-3.5 w-3.5"
                                    viewBox="0 0 16 16"
                                    fill="currentColor"
                                >
                                    <circle
                                        data-name="ellipse"
                                        cx="8"
                                        cy="8"
                                        r="8"
                                    ></circle>
                                </svg>
                            </div>
                        </label>
                        <label
                            class="mt-px cursor-pointer select-none text-white"
                            for="html"
                        >
                            5 minutes
                        </label>
                    </div>
                    <div class="inline-flex items-center">
                        <label
                            class="relative flex cursor-pointer items-center rounded-full p-3"
                            for="html"
                            data-ripple-dark="true"
                        >
                            <input
                                id="html"
                                name="type"
                                type="radio"
                                class="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-full border border-blue-gray-200 text-pink-500 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-pink-500 checked:before:bg-pink-500 hover:before:opacity-10"
                                value="30"
                                checked={disappearingMessageTime === 30}
                                onChange={() => handleTimeSelection(30)}
                            />
                            <div class="pointer-events-none absolute top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 text-pink-500 opacity-0 transition-opacity peer-checked:opacity-100">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="h-3.5 w-3.5"
                                    viewBox="0 0 16 16"
                                    fill="currentColor"
                                >
                                    <circle
                                        data-name="ellipse"
                                        cx="8"
                                        cy="8"
                                        r="8"
                                    ></circle>
                                </svg>
                            </div>
                        </label>
                        <label
                            class="mt-px cursor-pointer select-none text-white"
                            for="html"
                        >
                            30 minutes
                        </label>
                    </div>
                    <div class="inline-flex items-center">
                        <label
                            class="relative flex cursor-pointer items-center rounded-full p-3"
                            for="html"
                            data-ripple-dark="true"
                        >
                            <input
                                id="html"
                                name="type"
                                type="radio"
                                class="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-full border border-blue-gray-200 text-pink-500 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-pink-500 checked:before:bg-pink-500 hover:before:opacity-10"
                                value="60"
                                checked={disappearingMessageTime === 60}
                                onChange={() => handleTimeSelection(60)}
                            />
                            <div class="pointer-events-none absolute top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 text-pink-500 opacity-0 transition-opacity peer-checked:opacity-100">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="h-3.5 w-3.5"
                                    viewBox="0 0 16 16"
                                    fill="currentColor"
                                >
                                    <circle
                                        data-name="ellipse"
                                        cx="8"
                                        cy="8"
                                        r="8"
                                    ></circle>
                                </svg>
                            </div>
                        </label>
                        <label
                            class="mt-px cursor-pointer select-none text-white"
                            for="html"
                        >
                            60 minutes
                        </label>
                    </div>
                    <div class="inline-flex items-center">
                        <label
                            class="relative flex cursor-pointer items-center rounded-full p-3"
                            for="html"
                            data-ripple-dark="true"
                        >
                            <input
                                id="html"
                                name="type"
                                type="radio"
                                class="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-full border border-blue-gray-200 text-pink-500 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-pink-500 checked:before:bg-pink-500 hover:before:opacity-10"
                                value="1440"
                                checked={disappearingMessageTime === 1440}
                                onChange={() => handleTimeSelection(1440)}
                            />
                            <div class="pointer-events-none absolute top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 text-pink-500 opacity-0 transition-opacity peer-checked:opacity-100">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="h-3.5 w-3.5"
                                    viewBox="0 0 16 16"
                                    fill="currentColor"
                                >
                                    <circle
                                        data-name="ellipse"
                                        cx="8"
                                        cy="8"
                                        r="8"
                                    ></circle>
                                </svg>
                            </div>
                        </label>
                        <label
                            class="mt-px cursor-pointer select-none text-white"
                            for="html"
                        >
                            1 day
                        </label>
                    </div>
                    <div class="inline-flex items-center">
                        <label
                            class="relative flex cursor-pointer items-center rounded-full p-3"
                            for="html"
                            data-ripple-dark="true"
                        >
                            <input
                                id="html"
                                name="type"
                                type="radio"
                                class="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-full border border-blue-gray-200 text-pink-500 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-pink-500 checked:before:bg-pink-500 hover:before:opacity-10"
                                value="10080"
                                checked={disappearingMessageTime === 10080}
                                onChange={() => handleTimeSelection(10080)}
                            />
                            <div class="pointer-events-none absolute top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 text-pink-500 opacity-0 transition-opacity peer-checked:opacity-100">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="h-3.5 w-3.5"
                                    viewBox="0 0 16 16"
                                    fill="currentColor"
                                >
                                    <circle
                                        data-name="ellipse"
                                        cx="8"
                                        cy="8"
                                        r="8"
                                    ></circle>
                                </svg>
                            </div>
                        </label>
                        <label
                            class="mt-px cursor-pointer select-none text-white"
                            for="html"
                        >
                            7 day
                        </label>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default Chatbar
