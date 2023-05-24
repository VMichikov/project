import React, { Component } from "react";
import { BrowserRouter as Router, Route, Link, Redirect, BrowserHistory, Switch } from "react-router-dom";
import WebRTCCall from "./pages/WebRTCCall";
import { connect } from "react-redux";
import { dispatcher } from "./redux/redux";
import utils from "./utils/utils";
import RightBar from "./components/RightBar";
import LeftBar from "./components/LeftBar";
import "./components/windows.css";

import "./App.css";
import sound from "../src/sounds/Sound1.mp3";
import Peer from "peerjs";
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isAuthorizing: false,
    };
    this.establishWsConnection = this.establishWsConnection.bind(this);
    // this.AudioPlay = this.AudioPlay.bind(this);
  }
  //TODO: Check if the websocket connection have been lost and re-establish it
  async componentDidMount() {
    //utils.savePagePathToLocalStorage(window.location.pathname);
    let token = localStorage.getItem("token");
    if (token != null) {
      dispatcher("setToken", { action: token, type: "" });
      this.setState({ isAuthorizing: true }, async () => {
        await this.establishWsConnection(token);
        this.setState({ isAuthorizing: false });
      });
    } else {
      dispatcher("setAuthorized", { action: false, type: "" });
    }
    console.log();
    window.addEventListener("beforeunload", this.beforeUnload.bind(this));
  }
  beforeUnload() {
    localStorage.removeItem("pages");
  }
  async componentDidUpdate(prevProps, prevState) {
    //In case the web app was not loaded and authorized already on the other component
    if (this.props.token !== null && this.props.token !== prevProps.token && !this.state.isAuthorizing) {
      await this.establishWsConnection(this.props.token);
    }
    //This is responsible for the file upload progress and other stuff events listener.
    if (this.props.serviceWorker.length !== 0 && prevProps.serviceWorker !== this.props.serviceWorker) {
      //TODO: Add check for file name, because in case of uploading multiple files it can work incorrectly
      utils.serviceWorkerListener(this.props.serviceWorker, this.props.token, this.props.websocket);
    }
  }
  async establishWsConnection(token) {
    let serverTokenResponse = [0];
    let websocket = new WebSocket(`wss://localhost:8080/hello/sdsd/?token=${token}`, "echo-protocol");
    websocket.onmessage = (event) => {
      //console.log(event.data);
      let data = JSON.parse(event.data);
      //TODO: Проверить на наличие всех нужных событий
      if (data.event === "listDialogMessages") {
        //nothing, I made an async/await handler on it in Dialog.jsx and Utils.js
      } else if (data.event === "listFriends") {
        //nothing, I made an async/await handler on it in Dialog.jsx and Utils.js
      } else if (data.event === "listRequests") {
        //nothing, I made an async/await handler on it in Dialog.jsx and Utils.js
      } else if (data.event === "listResponces") {
        //nothing, I made an async/await handler on it in Dialog.jsx and Utils.js
      } else if (data.event === "error") {
        dispatcher("setError", { action: data.payload, type: "" });
      } else if (data.event === "connectionResponse") {
        dispatcher("setUserId", { action: data.userId, type: "" });
      } else if (data.event === "tokenInfo") {
        if (data.payload === "tokenError") {
          serverTokenResponse[0] = 1;
        } else {
          serverTokenResponse[0] = 2;
        }
      } else if (data.event === "incomingCall") {
        let payload = JSON.parse(data.payload);
        var audio = new Audio(sound);
        audio.autoplay = "autoplay";
        audio.play();
        setTimeout(async () => {
          if (window.confirm(`Ответить на звонок от ${payload.sourceName}?`)) {
            audio.pause();
            //stream.getVideoTracks()[0].enabled = false;
            let stream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: true,
            });
            const myPeer = new Peer(undefined, {
              path: "/peerjs",
              host: "/",
              //port: "3443",
              port: "4000", //, for backup.server.js
              secure: true,
            });
            dispatcher("setWebRTCParams", { action: { myPeer: myPeer, stream: stream }, type: "" });
            dispatcher("setSourceIdAndPeerIdForACall", { action: [payload.sourceId, payload.peerId, payload.receiverId], type: "" });
            dispatcher("setCallId", { action: this.props.sourceIdAndPeerIdForACall[0], type: "" });
          } else {
            this.props.websocket.send(
              JSON.stringify({
                event: "IncomingCallReject",
                payload: JSON.stringify({ sourceId: payload.sourceId }),
              })
            );
          }
        }, 100);
      } else {
        dispatcher("setWebsocketResponse", { action: event.data, type: "" });
      }
    };
    let isConnectionEstablished = await utils.connection(websocket);
    if (serverTokenResponse[0] !== 0 || isConnectionEstablished) {
      let isTokenValid = await utils.isTokenValid(serverTokenResponse);
      if (isTokenValid) {
        dispatcher("setWebsocketAndAuth", { action: { websocket: websocket, auth: true }, type: "" }); //For 2 renders instead of 3
        // dispatcher("authorized");
      } else {
        dispatcher("setErrorAndAuth", { action: "wrong_token", type: "" });
        // dispatcher("setError", { action: "wrong_token", type: "" });
        //localStorage.removeItem("token");
      }
    } else {
      //TODO: Check this condition
      dispatcher("setErrorAndAuth", {
        action: "cannot_establish_connection",
        type: "",
      });
      // dispatcher("setError", { action: "wrong_token", type: "" });
    }
  }

  // answer() {
  //   alert("answered!");
  // }
  // deny() {
  //   alert("denyed!");
  // }
  render() {
    console.log("render App.jsx");
    return (
      <div>
        <div id="video-grid"></div>
        {/* {this.props.sourceIdAndPeerIdForACall.length !== 0 ? <Redirect to={`/friendlist/webRTCCall/${this.props.sourceIdAndPeerIdForACall[0]}`} /> : null} */}
        {this.props.callId !== null ? <WebRTCCall /> : null}
        <div className="mainDiv">
          <LeftBar />
          <RightBar />
        </div>

        <div id="myModal" class="modal">
          <div class="modal-content">
            <span class="close">&times;</span>
            <p>Message</p>
          </div>
        </div>
      </div>
    );
  }
}
function mapStateToProps(state) {
  return {
    token: state.token,
    isAuth: state.isAuth,
    websocket: state.websocket,
    error: state.error,
    sourceIdAndPeerIdForACall: state.sourceIdAndPeerIdForACall,
    notificationsList: state.notificationsList,
    notificationsCounter: state.notificationsCounter,
    serviceWorker: state.serviceWorker,
    stream: state.stream,
    myPeer: state.myPeer,
    callId: state.callId,
    streamBlocks: state.streamBlocks,
  };
}

export default connect(mapStateToProps)(App);

function PrivateRoute({ isAuth: isAuth, component: Component, ...rest }) {
  return (
    <Route
      {...rest}
      render={(props) => {
        if (isAuth) {
          return <Component />;
        } else {
          return <Redirect to={{ pathname: "/", state: { from: props.location } }} />;
        }
      }}
    />
  );
}
