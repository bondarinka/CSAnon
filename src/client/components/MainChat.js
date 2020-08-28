import React, { useState, useRef, useContext, useLayoutEffect } from "react";
import SocketContext from "../context/SocketContext";

export default function MainChat(props) {
  const [messageData, setMessageData] = useState([]);
  const [users, setUsers] = useState(0);
  const [userlist, setUserList] = useState([]);
  const inputMessageRef = useRef(null);
  const chatRef = useRef(null);
  const socket = useContext(SocketContext);
  const inputSearchRef = useRef(null);

  const handleSearch = (e) => {
    if (inputSearchRef.current.value.length !== 0) {
      const matchedMessages = [];
      socket.disconnect(true);
      messageData.forEach((element) => {
        const lowerCasedMassage = element.message.toLowerCase();
        if (lowerCasedMassage.search(inputSearchRef.current.value) !== -1) {
          matchedMessages.push(element);
        }
      });
      setMessageData(matchedMessages);
    } else {
      getData();
      socket.disconnect(false);
    }
    e.preventDefault();
  };
  const handleSendClick = (e) => {
    if (inputMessageRef.current.value.length > 1) {
      e.preventDefault();
      const data = {
        message: inputMessageRef.current.value,
        username: props.location.state.username,
      };
      inputMessageRef.current.value = "";
      socket.emit("message", data);
    }
  };

  socket.on("count", (data) => {
    setUsers(data);
  });

  socket.on("userlist", (data) => {
    setUserList(data);
  });

  socket.on("data", (data) => {
    console.log(data);
  });

  socket.on("newMessage", (data) => {
    //{username, userURL, timestamp, message}
    const newArr = [...messageData];
    newArr.push(data);
    setMessageData(newArr);
  });

  //TODO: add function for request more messages on scroll up
  //TODO: not scrolling to bottom on initial load
  const getData = () => {
    fetch("/messages/all")
      .then((res) => res.json())
      .then((res) => {
        setMessageData(res);
      });
  };

  if (messageData.length === 0) {
    getData();
  }

  //make sure the 'chat' div is scrolled to the bottom with every render
  useLayoutEffect(() => {
    chatRef.current.scrollTop = chatRef.current.scrollHeight;
  });

  return (
    <div className="mainContainer mainChat">
      <div className="sidebar">
        <p className="displayName">{props.location.state.username}</p>
        <img src={props.location.state.userURL} />
        <h1>Users: {users}</h1>
        {userlist.map((el) => (
          <div>{el}</div>
        ))}
        {/* TODO: add log out functionalities */}
        {/*<button>Log out of GitHub</button>
    <button>Log out of Anon ID</button>*/}
      </div>

      <div className="chatContainer">
        <div className="form" onChange={handleSearch}>
          <input
            type="text"
            ref={inputSearchRef}
            placeholder="Search messages"
          ></input>
        </div>
        <div className="chat" ref={chatRef}>
          {/* assumes most recent message is at the end of the array */}
          {messageData.map((message) => (
            <Message
              key={JSON.stringify(message) + Math.random()}
              yourName={props.location.state.username}
              {...message}
            />
          ))}
        </div>
        <form className="inputArea" onClick={handleSendClick}>
          <input
            type="text"
            ref={inputMessageRef}
            placeholder="Send message"
          ></input>
          <span>|</span>
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}

function Message(props) {
  const className =
    "messageContainer" + (props.yourName === props.username ? " self" : "");
  return (
    <div className={className}>
      <img src={props.userURL} />
      <div className="textContainer">
        <span>{props.username}</span>
        <p>{props.message}</p>
      </div>
    </div>
  );
}
