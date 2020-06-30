import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import SocketContext from "../context/SocketContext";
// import UserContext from '../context/UserContext';

export default function AnonIdChoicePage() {
  /*
    constructor (props) {
      super(props)
      this.state = {
        anonId : {username: ', userURL''},
        isLoading: true
      }
    }
  */
  const [anonId, setAnonId] = useState({ username: "", userURL: "" });
  const [isLoading, setIsLoading] = useState(true);
  const socket = useContext(SocketContext);

  // TEST !
  // const user = useContext(UserContext);

  const handleRerollClick = () => {
    //this.setState({isLoading: true})
    setIsLoading(true);
  };

  const handleGoToChatClick = () => {
    // TEST: save username in session storage ?
    // socket.emit("signin", { username: sessionStorage.getItem('username') });
    socket.emit("signin", { username: anonId.username });
  };

  const getNewIdBecauseError = () => {
    //this separate request is to prevent the backend from saving an anonId cookie
    //until an ID with a non-broken image is found
    let rt = '/id/true';
    fetch(rt)
      .then(res => res.json())
      .then(result => {
        console.log(result);
        setIsLoading(false);
        setAnonId(result);
      });
  }

  const getNewId = () => {
    let rt = '/id/false';
    fetch(rt)
      .then(res => res.json())
      .then(result => {
        // console.log(result);
        setIsLoading(false);
        setAnonId(result);
      });
  };

  //on initial render, get an ID asynchronously
  if (isLoading) {
    getNewId();
  }

  return (
    <div className="mainContainer anonChoice">
      {isLoading ? <p>Loading...</p> : (
        <>
          {/* TODO: add log out functionality */}
          {/*<button>Log out of GitHub</button>*/}
          <img src={anonId.userURL} onError={getNewIdBecauseError} />
          <p className="name">{anonId.username}</p>
          <div className="row">
            <button onClick={handleRerollClick}>Rerolllll new ID</button>
            <Link
              className="btn"
              to={{ pathname: "/chat", state: anonId }}
              onClick={handleGoToChatClick}
            >
              Go to chat
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

/*

Receive from '/id/ endpoint:

userID = {
  username: String,
  userURL: String,
}

**keep username in session storage**

on go to chat, submit username to '/id/pick/' (will register in redis)

*/
