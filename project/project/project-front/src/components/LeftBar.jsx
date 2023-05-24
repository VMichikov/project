import React, { Component } from "react";
import { dispatcher } from "../redux/redux";
import { connect } from "react-redux";
import { BrowserRouter as Router, Route, Link, Redirect, BrowserHistory, Switch } from "react-router-dom";
import getHistory from "./history";
import WebRTCCall from "../pages/WebRTCCall";
import { store } from "../redux/redux";

class LeftBar extends Component {
  constructor(props) {
    super(props);
    this.logOut = this.logOut.bind(this);
  }
  logOut() {
    this.props.websocket.close();
    dispatcher("setWebsocket", { action: null, type: "" });
    dispatcher("isNotAuthorized");
    localStorage.removeItem("token");
  }
  soundMute = () => {
    //dispatcher("setCallId", { action: null, type: "" });
    let stream = this.props.streamBlocks.find((x) => x.streamtype === "myVideo");
    if (stream !== null) {
      let enabled = stream.getAudioTracks()[0].enabled;
      if (enabled) {
        stream.getAudioTracks()[0].enabled = false;
      } else {
        stream.getAudioTracks()[0].enabled = true;
      }
    } else {
      console.log("stream is eq to null");
    }
  };
  videoMute = () => {
    let stream = this.props.streamBlocks.find((x) => x.streamtype === "myVideo");
    if (stream !== null) {
      let enabled = stream.getVideoTracks()[0].enabled;
      if (enabled) {
        stream.getVideoTracks()[0].enabled = false;
      } else {
        stream.getVideoTracks()[0].enabled = true;
      }
    } else {
      console.log("stream is eq to null");
    }
  };
  shareScreen = async () => {
    let storeState = store.getState();
    let propsStreamBlocks = [...storeState.streamBlocks];
    let screen = propsStreamBlocks.find((x) => x.streamtype === "myScreen");
    if (screen === undefined) {
      dispatcher("setScreenStream", { action: true, type: "" });
      //this.setState({ screenShareGrid: screenShareGrid });
    } else {
      this.state.screenStm.getTracks().forEach(function (track) {
        track.stop();
      });
      //this.setState({ screenStm: null });
      // let screen = this.state.streamBlocks.find((streamBlocks) => streamBlocks.streamtype === "myScreen");
      propsStreamBlocks.splice(propsStreamBlocks.indexOf(screen), 1);
      this.setState({ streamBlocks: this.state.streamBlocks }, () => {
        dispatcher("setStreamBlocks", { action: propsStreamBlocks, type: "" });
      });
      this.props.websocket.send(
        JSON.stringify({
          event: "disableShareScreen",
          payload: JSON.stringify({ callMemberId: this.props.callId }),
        })
      );
    }
    //this.state.screenShareGrid.append(captureStream);
  };
  finishTheCall() {
    this.props.websocket.send(
      JSON.stringify({
        event: "finishTheCall",
        payload: JSON.stringify({ callMemberId: this.props.callId }),
      })
    );
    this.props.myPeer.disconnect();
    this.props.stream.getTracks().forEach(function (track) {
      track.stop();
    });

    dispatcher("setWebRTCParams", { action: { myPeer: null, stream: null }, type: "" });
    dispatcher("setCallId", { action: null, type: "" });
    dispatcher("setStreamBlocks", { action: [], type: "" });
    dispatcher("setVideoBlocks", { action: [], type: "" });

    let backgroundCall = document.getElementById("video-grid");
    backgroundCall.innerHTML = "";
    // for (let i = 0; i < backgroundCall.children.length; ++i) {
    //     // backgroundCall.children[i].pause();
    //     backgroundCall.children[i].muted = true;
    //   }
    // // if (this.state.previousPage !== null) {
    // //this.props.history.push(this.state.previousPage);
    // if (window.history.prevPage !== undefined) {
    //   this.changePage(window.history.prevPage);
    //   //this.props.history.goBack();
    // } else {
    //   this.changePage("/");
    // }
    // //}
  }
  changePage(path, e) {
    //history.push("/files");
    getHistory().push(`/${path}`);
  }
  render() {
    let callSettings = (
      <div>
        <button onClick={this.videoMute.bind(this)}>videoMute</button>
        <button onClick={this.soundMute.bind(this)}>soundMute</button>
        <button onClick={this.shareScreen.bind(this)}>shareScreen</button>
        <button onClick={this.finishTheCall.bind(this)}>finish the call</button>
      </div>
    );
    if (this.props.isAuth) {
      return (
        <div className="leftBar">
          <ul>
            <li>
              <a onClick={this.changePage.bind(this, "startpage")}>StartPage</a>
            </li>
            <li>
              <a onClick={this.changePage.bind(this, "protected")}>Protected Page</a>
            </li>
            <li>
              <a onClick={this.changePage.bind(this, "friends")}>Friends</a>
            </li>
            <li>
              <a onClick={this.changePage.bind(this, "dialogs")}>Dialogs Page</a>
            </li>
            <li>
              <a onClick={this.changePage.bind(this, "files")}>Files</a>
            </li>
          </ul>

          {this.props.leftBarList !== null ? (
            <div>
              Dialogs list
              {this.props.leftBarList}
            </div>
          ) : null}
          <button onClick={this.logOut}>Log out</button>
          {this.props.streamBlocks.length !== 0 ? callSettings : null}
        </div>
      );
    } else {
      return (
        <div>
          {" "}
          LeftBar Вы не авторизованы
          <li>
            <a onClick={this.changePage.bind(this, "startpage")}>StartPage</a>
          </li>
        </div>
      );
    }
  }
}
function mapStateToProps(state) {
  return {
    websocket: state.websocket,
    isAuth: state.isAuth,
    error: state.error,
    streamBlocks: state.streamBlocks,
    callId: state.callId,
    myPeer: state.myPeer,
    stream: state.stream,
    videoBlocks: state.videoBlocks,
    leftBarList: state.leftBarList,
    screenSream: state.screenSream,
  };
}

export default connect(mapStateToProps)(LeftBar);
