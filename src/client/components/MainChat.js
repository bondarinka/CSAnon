import React, { useState, useRef, useContext } from 'react';
import SocketContext from '../context/SocketContext';
 
export default function MainChat(props) {
  const [messageData, setMessageData] = useState([]);
  const inputMessageRef = useRef(null);
  const chatRef = useRef(null);
  const socket = useContext(SocketContext);
  const inputSearchRef= useRef(null)
  
  const handleSearch = (e) =>{
    if(inputSearchRef.current.value.length !== 0){
      const matchedMessages = [];
      socket.disconnect(true)
      messageData.forEach((element) => {
        const lowerCasedMassage= element.message.toLowerCase()
        if(lowerCasedMassage.search(inputSearchRef.current.value)!==-1){
          matchedMessages.push(element)
        }
      })
      setMessageData(matchedMessages)
    }
    else{
      getData()
      socket.disconnect(false)
    }
    e.preventDefault()
  }

  const handleSendClick = (e) => {
    if (inputMessageRef.current.value.length > 1) {
      e.preventDefault();
      const data = {
        message: inputMessageRef.current.value,
        username: props.location.state.username,
      };
      inputMessageRef.current.value = '';
      socket.emit('message', data);
    }
  };

  socket.on('newMessage', (data) => {
    //{username, userURL, timestamp, message}
    const newArr = [...messageData];
    newArr.push(data);
    setMessageData(newArr);
    chatRef.current.scrollTop = chatRef.current.scrollHeight;
  });

  //TODO: add function for request more messages on scroll up
  //TODO: not scrolling to bottom on initial load
  const getData = () => {
    fetch('/messages/all')
      .then((res) => res.json())
      .then((res) => {
        setMessageData(res);
      })
      .then(() => chatRef.current.scrollTop = chatRef.current.scrollHeight);
  }
  if (messageData.length === 0) {
    getData()
  }
  
  return (
    <div className='mainContainer mainChat'>
    <div className='sidebar'>
    <p className='displayName'>{props.location.state.username}</p>
    <img src={props.location.state.userURL} />
    {/* TODO: add log out functionalities */}
    {/*<button>Log out of GitHub</button>
    <button>Log out of Anon ID</button>*/}
    </div>
    <div onChange={handleSearch}>
        <input type='text' ref={inputSearchRef} placeholder='Search messages'></input>
        <span>|</span>
        <button type='search'  >Search</button>
    </div>
      <div className='chatContainer'>
      <div className='chat' ref={chatRef}>
      {/* assumes most recent message is at the end of the array */}
      {messageData.map((message) => (
        <Message key={JSON.stringify(message)+ Math.random()}
        yourName={props.location.state.username}
        {...message} />
        ))}
        </div>
        <form className='inputArea' onClick={handleSendClick}>
        <input type='text' ref={inputMessageRef} placeholder='Send message'></input>
        <span>|</span>
        <button type='submit'>Send</button>
        </form>
      </div>
    </div>
  );
}

function Message(props) {
  const className = 'messageContainer' + (props.yourName === props.username ? ' self' : '');
  return (
    <div className={className}>
      <img src={props.userURL} />
      <div className='textContainer'>
        <span>{props.username}</span>
        <p>{props.message}</p>
      </div>
    </div>
  );
}
