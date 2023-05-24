import React, { Component } from "react";
import { dispatcher } from "../redux/redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import utils from "../utils/utils";
import Error from "./Error";
import Peer from "peerjs";
import Dialogs from "./Dialogs";

class Dialog extends Component {
  constructor(props) {
    super(props);
    this.state = { messages: [], inputMessage: "", isLoading: true };
    this.logOut = this.logOut.bind(this);
    this.handleChangeMessage = this.handleChangeMessage.bind(this);
    this.changeSoundSource = this.changeSoundSource.bind(this);
    this.requestDialogMessages = this.requestDialogMessages.bind(this);
  }
  logOut() {
    this.props.websocket.close();
    dispatcher("setWebsocket", { action: null, type: "" });
    dispatcher("isNotAuthorized");
    localStorage.removeItem("token");
  }
  changeSoundSource() {
    //Change this 2 elems to the real case multiples.
    let backgroundCall = document.getElementById("video-grid");
    let f = document.getElementById("vid1");
    if (f !== null) {
      f.muted = true;
    }

    let g = document.getElementById("vid2");
    //if (backgroundCall.children.length > 1) {
    if (f !== null && g !== null) dispatcher("setVideoBlocks", { action: [f, g], type: "" });
    // } else {
    //     if (f !== null) dispatcher("setVideoBlocks", { action: [f], type: "" });
    // }

    for (let i = 0; i < backgroundCall.children.length; ++i) {
      // backgroundCall.children[i].pause();
      backgroundCall.children[i].muted = true;
    }
  }
  async requestDialogMessages() {
    let isConnectionEstablished = await utils.connection(this.props.websocket);
    if (isConnectionEstablished) {
      this.props.websocket.send(JSON.stringify({ event: "listDialogsMessages", dialogsList: [this.props.match.params.id] }));
      let response = await utils.getWsResponse(this.props.websocket, "listDialogMessages");
      let res = JSON.parse(response).map((item) => {
        return [item.id, item.source_id, item.text, item.is_pending];
      });
      this.setState({ messages: res, isLoading: false });
    }
  }
  async componentDidMount() {
    //Do I really need this here?
    if (this.props.isAuth !== null && !this.props.isAuth) {
      this.setState({ isLoading: false });
    }
    //Can be null at the moment of mounting
    if (this.props.websocket != null) {
      await this.requestDialogMessages();
    }
    if (this.props.callId === this.props.match.params.id && this.props.streamBlocks.length !== 0) {
      this.changeSoundSource();
    }
  }
  async componentDidUpdate(prevProps, prevState) {
    if (this.props.websocket != null && this.props.match.params.id !== prevProps.match.params.id) {
      await this.requestDialogMessages();
    }
    //In case the web app was not loaded and authorized already on the other component
    if (prevProps.isAuth === null && this.props.isAuth !== null && !this.props.isAuth) {
      this.setState({ isLoading: false });
    }
    if (prevProps.websocketResponse !== this.props.websocketResponse && this.props.websocketResponse != null) {
      let data = JSON.parse(this.props.websocketResponse);
      //dispatcher("setWebsocketResponse", { action: null, type: "" }); //Do I really need it? I probably cause the odd rerender
      console.log(data);
      //TODO: create a check for directMessageResponse from other dialogs in here somehow
      //data.userId is checket for updating messages only from this dialog
      if (data.event === "dialogViewed" && data.userId === this.props.match.params.id) {
        let messages = this.state.messages;
        messages.forEach((item) => {
          item[3] = 2;
        });
        this.setState({ messages: messages });
      } else if (data.event === "dialogReceived" && data.userId === this.props.match.params.id) {
        let messages = this.state.messages;
        messages.forEach((item) => {
          if (item[3] === 0) item[3] = 1;
        });
        this.setState({ messages: messages });
      } else if (data.event === "directMessage" && data.userId === this.props.match.params.id) {
        let messages = this.state.messages;
        messages.push([data.payload.id, data.payload.source_id, data.payload.text, data.payload.is_pending]);
        this.setState({ messages: messages });
      } else if (data.event === "directMessageResponse" && data.userId === this.props.match.params.id) {
        let approvedMessage = data.payload;
        let messages = this.state.messages;
        let message = messages.find((x) => x[2] === approvedMessage.text && approvedMessage.destination_id === this.props.match.params.id && x[3] === data.randomId);
        if (message != null) {
          message[0] = approvedMessage.id;
          message[3] = approvedMessage.is_pending;
        } else {
          message = [approvedMessage.id, approvedMessage.source_id, approvedMessage.text, approvedMessage.is_pending];
          messages.push(message);
        }
        this.setState({ messages: messages });
      }
      // else if (data.event === "listDialogMessages") {
      //     let res = JSON.parse(data.payload).map((item) => {
      //         return [item.id, item.source_id, item.text, item.is_pending];
      //     });
      //     this.setState({ messages: res, isLoading: false });
      // }
    }
    if (this.state.messages.length === 0) {
      //I need this because ws can be eq null and then be established with the localStorage's token
      if (prevProps.websocket !== this.props.websocket && this.props.websocket != null) {
        let isConnectionEstablished = await utils.connection(this.props.websocket);
        if (isConnectionEstablished) {
          this.props.websocket.send(JSON.stringify({ event: "listDialogsMessages", dialogsList: [this.props.match.params.id] }));
          let response = await utils.getWsResponse(this.props.websocket, "listDialogMessages");
          let res = JSON.parse(response).map((item) => {
            return [item.id, item.source_id, item.text, item.is_pending];
          });
          this.setState({ messages: res, isLoading: false });
        }
      }
    }
    if (this.props.callId === this.props.match.params.id && this.props.streamBlocks.length !== 0 && prevProps.streamBlocks != this.props.streamBlocks) {
      this.changeSoundSource();
    }
  }
  componentWillUnmount() {
    //Change this 2 elems to the real case multiples.
    if (this.props.callId === this.props.match.params.id) {
      let f = document.getElementById("vid1");
      f.muted = true;
      let g = document.getElementById("vid2");

      dispatcher("setVideoBlocks", { action: [], type: "" });
      let backgroundCall = document.getElementById("video-grid");
      for (let i = 0; i < backgroundCall.children.length; ++i) {
        f.muted = true;
        g.muted = true;
        //backgroundCall.children[i].play();
        backgroundCall.children[i].muted = false;
      }
    }
  }
  // shouldComponentUpdate(nextProps, nextState) {
  //     if (this.props.websocketResponse != nextProps.websocketResponse && nextProps.websocketResponse === null && this.state.messages.length !== 0) {
  //         return false;
  //     } else {
  //         return true;
  //     }
  // }
  handleChangeMessage(e) {
    this.setState({
      inputMessage: e.target.value,
    });
  }
  sendMessage() {
    let randomInt = utils.getRandomInt();
    this.props.websocket.send(JSON.stringify({ event: "directMessage", dstUserId: this.props.match.params.id, message: this.state.inputMessage, randomId: randomInt }));
    let messages = this.state.messages;
    messages.push([parseInt(messages[messages.length - 1][0]) + 1, this.props.userId, this.state.inputMessage, randomInt]);
    this.setState({ messages: messages });
  }
  async makeACall(friendId, e) {
    let stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    if (stream.getVideoTracks()[0].enabled === false && stream.getAudioTracks()[0].enabled === false) {
      this.popup();
      console.log("Вы не можете делать звонки без камеры и микро");
    } else {
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
      dispatcher("setCallId", { action: friendId, type: "" });
      //this.props.history.push(`/friendlist/webRTCCall/${friendId}`);
    }
  }
  render() {
    console.log("Dialog!");
    if (this.props.error === null) {
      if (this.state.isLoading || this.props.isAuth === null) {
        return <div>Loading ... </div>;
      } else {
        let messages = null;
        if (this.state.messages.length !== 0) {
          messages = this.state.messages.map((item) => {
            if (item[1] === this.props.userId) {
              return (
                <li key={item[0]}>
                  You: id {item[0]} {item[2]} {item[3] !== 1 && item[3] !== 2 ? "pending" : item[3] !== 0 && item[3] !== 2 ? "received" : "viewed"}
                </li>
              );
            } else {
              return (
                <li key={item[0]}>
                  Friend: id {item[0]} {item[2]}
                </li>
              );
            }
          });
        }
        let inputBlock =
          this.props.websocket !== null && this.state.messages !== null && this.state.messages.length !== 0 ? (
            <div>
              <input onChange={this.handleChangeMessage} type="text" id="fname" name="fname" value={this.state.inputMessage} />
              <button onClick={this.sendMessage.bind(this)}>Send</button>
            </div>
          ) : null;
        if (this.props.isAuth) {
          if (!this.state.isLoading && this.state.messages.length === 0) {
            let messages = "Нет сообщений";
            return <div>{messages}</div>;
          } else {
            return (
              <div>
                <Dialogs dialogs />
                {this.props.callId !== this.props.match.params.id ? <button onClick={this.makeACall.bind(this, this.props.match.params.id)}>Make a Call</button> : null}
                {this.props.callId === this.props.match.params.id ? (
                  <div id="allVid">
                    <video id="vid1"></video>
                    <video id="vid2"></video>
                    <video id="vid3"></video>
                  </div>
                ) : null}
                Dialog messages:
                <div className="messages">
                  <br />
                  {messages}
                  <br />
                </div>
                {inputBlock}
                <br />
                <button onClick={this.logOut}>Log out</button>
              </div>
            );
          }
        } else {
          return <div>Вы не авторизованы</div>;
        }
      }
    } else {
      return <Error />;
    }
  }
}
function mapStateToProps(state) {
  return {
    websocket: state.websocket,
    isAuth: state.isAuth,
    websocketResponse: state.websocketResponse,
    userId: state.userId,
    error: state.error,
    callId: state.callId,
    streamBlocks: state.streamBlocks,
  };
}
export default withRouter(connect(mapStateToProps)(Dialog));
