import React from 'react'

const Chatbubble = ({ index, message, user, disappearingMessageTime }) => {
    const arrayBufferToBase64 = (arrayBuffer) => {
        const byteArray = new Uint8Array(arrayBuffer)
        let binary = ''
        for (let i = 0; i < byteArray.byteLength; i++) {
            binary += String.fromCharCode(byteArray[i])
        }
        return btoa(binary)
    }

    function getCurrentTime(time) {
        const now = new Date(time)
        const hours = now.getHours()
        const minutes = now.getMinutes()
        const amOrPm = hours >= 12 ? 'PM' : 'AM'

        // Convert to 12-hour format
        const formattedHours = hours % 12 || 12

        // Ensure the hours and minutes are displayed with leading zeros if needed
        const formattedTime = `${String(formattedHours).padStart(
            2,
            '0'
        )}:${String(minutes).padStart(2, '0')}`

        return `${formattedTime} ${amOrPm}`
    }

    const isMessageRecent = () => {
        // Calculate the time difference in minutes
        const currentTime = new Date()
        const messageTime = new Date(message.time)
        const timeDifference = (currentTime - messageTime) / (1000 * 60) // Convert to minutes
        if(disappearingMessageTime === 0) return true
        return timeDifference < disappearingMessageTime
    }

    // Check if the message is recent, and if it's not, return null
    if (!isMessageRecent()) {
        return null
    }

    return (
        <div
            key={index}
            className={`max-w-s text-xl mx-2 rounded py-2 px-4 p-2 flex flex-col ${
                message.sender === user
                    ? 'float-right bg-green-600 text-white dark:bg-color-surface-100 ml-auto'
                    : 'clear-both float-left bg-green-400 text-gray-800 dark:bg-[#005C4B] dark:text-white mr-auto'
            }`}
        >
            {typeof message.message !== 'string' &&
            message.message.type === 'image' ? (
                <img
                    className="h-56 w-auto m-3 rounded-md"
                    src={`${message.message.url}`}
                    alt=""
                />
            ) : null}

            {typeof message.message !== 'string' &&
            message.message.type === 'video' ? (
                <video
                    controls
                    className="h-56 w-auto m-3 rounded-md"
                    src={`${message.message.url}`}
                    alt=""
                />
            ) : null}

            {typeof message.message !== 'string' &&
            message.message.type === 'audio' ? (
                <audio
                    controls
                    className="h-56 m-3 rounded-md"
                    src={`${message.message.url}`}
                    alt=""
                />
            ) : null}

            {typeof message.message !== 'string' &&
            message.message.type === 'file' ? (
                <iframe
                    loading="lazy"
                    allowFullScreen={true}
                    allow="fullscreen"
                    className="h-96 w-auto m-3 rounded-md"
                    src={`${message.message.url}`}
                    alt=""
                />
            ) : null}

            {!message.message.type ? <span>{message.message}</span> : null}

            <div className="text-sm text-end">{getCurrentTime(message.time)}</div>
        </div>
    )
}

export default Chatbubble
