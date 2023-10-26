import React from 'react';

const Chatbubble = ({ index, message, user }) => {
  return (
    <div
      key={index}
      className={`max-w-s text-xl mx-2 rounded py-2 px-4 p-2 flex flex-col ${message.sender === user
          ? 'float-right bg-green-600 text-white dark:bg-color-surface-100 ml-auto'
          : 'clear-both float-left bg-green-400 text-gray-800 dark:bg-[#005C4B] dark:text-white mr-auto'
        }`}
    >
      {typeof message.message !== 'string' && message.message.type === 'image' ? (
        <img className='h-56 w-auto m-3 rounded-md' src={message.message.url} alt="" />
      ) : null}

      {typeof message.message !== 'string' && message.message.type === 'video' ? (
        <video controls className='h-56 w-auto m-3 rounded-md' src={message.message.url} alt="" />
      ) : null}

      {typeof message.message !== 'string' && message.message.type === 'file' ? (
        <iframe
          loading='lazy'
          allowFullScreen={true}
          allow='fullscreen'
          className='h-96 w-auto m-3 rounded-md'
          src={message.message.url}
          alt=""
        />
      ) : null}

      {!message.message.type ? <span>{message.message}</span> : null}

      <div className='text-sm text-end'>{message.time}</div>
    </div>
  );
};

export default Chatbubble;
