import React from "react";
import { useHistory } from "react-router-dom";
import Header from "./Header";
import { ChatEngine } from "react-chat-engine";
import ChatFeed from "./chat components/ChatFeed";
import NotLoggedIn from "./NotLoggedIn";
import CryptoJS from "crypto-js";

const projectID = "9e45fcff-6309-40db-b521-4ef91549ccd2";

function Chat() {
  //let username = null;
  //let secret = null;
  //const history = useHistory();

  const username = localStorage.getItem("remember")
    ? localStorage.getItem("username")
    : sessionStorage.getItem("username");

  let secret = localStorage.getItem("remember")
    ? localStorage.getItem("password")
    : sessionStorage.getItem("password");

  if (secret && !sessionStorage.getItem("isAdmin")) {
    //decrypt password
    var bytes = CryptoJS.AES.decrypt(secret, "not so secret key");
    secret = bytes.toString(CryptoJS.enc.Utf8);
  }

  //console.log(username, secret);

  let component = (
    <div>
      <Header />
      {!username || !secret ? (
        <NotLoggedIn />
      ) : (
        <div>
          <ChatEngine
            height="100vh"
            projectID={projectID}
            userName={username}
            userSecret={secret}
            //renderChatFeed={(chatAppProps) => <ChatFeed {...chatAppProps} />}
          />
        </div>
      )}
    </div>
  );

  return component;
}

export default Chat;
