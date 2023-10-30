"use client"
import React, { useState, useRef, useEffect } from 'react'
import { BsEmojiSmile, BsFillMicFill } from 'react-icons/bs';
import { ImAttachment } from 'react-icons/im';
import AttachmentMenu from './AttachmentMenu';
import EmojiPicker from 'emoji-picker-react';


const Chatinput = ({handleSendMessage,setNewMessage,newMessage}) => {
    const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const toggleEmojiPicker = () => {
        setShowEmojiPicker(!showEmojiPicker);
    };

    const fileInputRef = useRef(null);

    const toggleAttachmentMenu = () => {
        setShowAttachmentMenu(!showAttachmentMenu);
    };

    const handleFileUpload = (e, fileType) => {
        const selectedFile = e.target.files[0];

        if (selectedFile) {
            // Convert the selected file to a blob URL
            // const blobUrl = URL.createObjectURL(selectedFile);
            // setNewMessage({ type: fileType, url: blobUrl });
            const reader = new FileReader();

            reader.onload = (e) => {
                const fileArrayBuffer = e.target.result;
                setNewMessage({ type: fileType, url: fileArrayBuffer });
                handleSendMessage();
            };

            reader.readAsArrayBuffer(selectedFile);
            handleSendMessage();
        }
        handleSendMessage();

        setShowAttachmentMenu(false);

        if (fileInputRef.current) {
            fileInputRef.current.value = null;
        }
    };
    useEffect(() => {
        if (typeof newMessage !== 'string') {
            handleSendMessage(); 
        }     
    }, [newMessage])
    
  return (
      <div className="bg-white dark:bg-color-surface-100 absolute bottom-0 w-[100%] p-4 px-3">
          <div className="flex">
              <button
                  className="ml-2 mx-1 px-1 py-2 bg-transparent text-gray-700 dark:text-gray-200 text-2xl rounded-md"
                  onClick={toggleEmojiPicker}
              >
                  <BsEmojiSmile />
              </button>
              {showEmojiPicker && (
                  <EmojiPicker
                    // className='absolute bottom-0 right-0'
                    style={{position:'absolute',bottom:'5rem'}}
                      onEmojiClick={(emoji, event) => {
                          // Handle the emoji click event here
                          const emojiText = emoji.emoji;
                          setNewMessage((prevMessage) => prevMessage + emojiText);
                      }}
                  />
                // <span>HIiiiiiiiiiiiiiii</span>
              )}

              <button
                  className="ml-2 mx-3 px-1 py-2 bg-transparent text-gray-700 dark:text-gray-200 text-2xl rounded-md"
                  onClick={toggleAttachmentMenu}
              >
                  <ImAttachment />
              </button>
              {showAttachmentMenu && (
                  <AttachmentMenu
                      onImageClick={() => {
                          if (fileInputRef.current) {
                              fileInputRef.current.click();
                          }
                      }}
                      onVideoClick={() => {
                          if (fileInputRef.current) {
                              fileInputRef.current.click();
                          }
                      }}
                      onAudioClick={() => {
                          if (fileInputRef.current) {
                              fileInputRef.current.click();
                          }
                      }}
                      onFileClick={() => {
                          if (fileInputRef.current) {
                              fileInputRef.current.click();
                          }
                      }}
                  />
              )}
              <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*,.pdf,audio/*" // Accept various file types
                  style={{ display: 'none' }}
                  onChange={(e) => {
                      // Determine the file type and pass it to the handler
                      if (e.target.files[0].type.startsWith('image/')) {
                          handleFileUpload(e, 'image');
                      } else if (e.target.files[0].type.startsWith('video/')) {
                          handleFileUpload(e, 'video');
                      } else if (e.target.files[0].type.startsWith('audio/')) {
                          handleFileUpload(e, 'audio');
                      } else {
                          handleFileUpload(e, 'file');
                      }
                  }}
              />
              <input
                  type="text"
                  className="flex-1 p-2 rounded-md border-none focus:outline-none text-black dark:text-white bg-white dark:bg-color-surface-200"
                  placeholder="Type your message..."
                  autoFocus
                  value={newMessage}
                  onClick={(e) => {
                      setShowEmojiPicker(false)
                      setShowAttachmentMenu(false)

                  }}
                  onChange={(e) => {
                    setNewMessage(e.target.value)
                }}
                  onKeyUp={(e) => {
                      if (e.key === 'Enter') {
                          handleSendMessage();
                      }
                  }}
              />
              <button
                  className="ml-2 px-4 py-2 bg-transparent text-gray-700 dark:text-gray-200 text-2xl rounded-md"
              >
                  <BsFillMicFill />
              </button>
          </div>
      </div>
  )
}

export default Chatinput
