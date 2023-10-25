import React from 'react'

const Chatbubble = ({index,message,user}) => {
  return (
    <div
      key={index}
      className={`max-w-s text-xl mx-2 rounded py-2 px-4 p-2 flex flex-col ${message.sender === user
        ? 'float-right bg-green-600 text-white dark:bg-color-surface-100 ml-auto'
        : 'clear-both float-left bg-green-400 text-gray-800 dark:bg-[#005C4B] dark:text-white mr-auto'
        }`}
    >
      {typeof message.message !== 'string' && message.message.type==='image'?
      (
        <img className='h-56 w-auto m-3 rounded-md' src={message.message.url} alt="" />
      ):(
        <></>
        )
      }
      {typeof message.message !== 'string' && message.message.type==='video'?
      (
          <video controls className='h-56 w-auto m-3 rounded-md' src={message.message.url} alt="" />
      ):(
        <></>
        )
      }
      {typeof message.message !== 'string' && message.message.type==='file'?
      (
          <iframe loading='lazy' allowFullScreen={true} allow='fullscreen' className='h-96 w-auto m-3 rounded-md' src={message.message.url} alt="" />
      ):(
        <span>{message.message}</span>
        )
      }
      


      {/* if (typeof message.message !== 'string' && message.message.type==='image') {
        <img className='h-56 w-auto m-3 rounded-md' src={message.message.url} alt="" />
      }
      else if (typeof message.message !== 'string' && message.message.type==='video') {
        <video className='h-56 w-auto m-3 rounded-md' src={message.message.url} alt="" />
      }
      else if (typeof message.message !== 'string' && message.message.type==='file') {
        
      }
      else{
        <span>{message.message}</span>
      } */}

      
      {/* <img className='h-56 w-auto m-3 rounded-md' src="https://images.ctfassets.net/hrltx12pl8hq/12wPNuS1sirO3hOes6l7Ds/9c69a51705b4a3421d65d6403ec815b1/non_cheesy_stock_photos_cover-edit.jpg" alt="" /> */}
      <div className='text-sm text-end'>{message.time}</div>
    </div>
  )
}

export default Chatbubble
