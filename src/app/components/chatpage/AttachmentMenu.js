import React from 'react'
import { ImAttachment } from 'react-icons/im'
import { BsFillImageFill, BsFileEarmarkMusicFill } from 'react-icons/bs'
import { MdVideoFile } from 'react-icons/md'
import { AiFillFilePdf } from 'react-icons/ai'

const AttachmentMenu = ({
    onImageClick,
    onVideoClick,
    onFileClick,
    onAudioClick,
}) => {
    return (
        <div className="absolute w-[12rem] flex justify-around p-3 bottom-[4.6rem] left-0 bg-color-surface-100 rounded-md">
            <button
                onClick={onImageClick}
                className="mx-1 text-gray-700 dark:text-gray-200 text-2xl"
            >
                {/* Add your image icon here */}
                <BsFillImageFill />
            </button>
            <button
                onClick={onVideoClick}
                className="mx-1 text-gray-700 dark:text-gray-200 text-2xl"
            >
                {/* Add your video icon here */}
                <MdVideoFile />
            </button>
            <button
                onClick={onAudioClick}
                className="mx-1 text-gray-700 dark:text-gray-200 text-2xl"
            >
                {/* Add your video icon here */}
                <BsFileEarmarkMusicFill />
            </button>
            <button
                onClick={onFileClick}
                className="mx-1 text-gray-700 dark:text-gray-200 text-2xl"
            >
                {/* Add your file icon here */}
                <AiFillFilePdf />
            </button>
        </div>
    )
}

export default AttachmentMenu
