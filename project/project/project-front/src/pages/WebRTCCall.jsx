import Peer from "peerjs";
import "./WebRTCCall.css";
import React, { Component } from "react";
// import { Redirect } from "react-router-dom";
import { connect } from "react-redux";
// import { withRouter } from "react-router";
import Error from "./Error";
import { dispatcher } from "../redux/redux";
import Loader from "./Loader";
import "./Loader.css";
import VideoCall from "./VideoCall";
import utils from "../utils/utils";
import { store } from "../redux/redux";

class WebRTCCall extends Component {
  constructor(props) {
    super(props);
    this.connectToNewUser = this.connectToNewUser.bind(this);
    this.addVideoStream = this.addVideoStream.bind(this);
    this.popup = this.popup.bind(this);
    this.state = { myPeer: null, videoGrid: null, screenShareGrid: null, stm: null, screenStm: null, peerId: null, streamBlocks: [], previousPage: null, tools: [true, true] };
  }

  async componentDidMount() {
    //utils.savePagePathToLocalStorage(this.props.location.pathname);
    // let pages = localStorage.getItem("pages");
    // if (pages !== null) {
    //   pages = JSON.parse(pages);
    //   if (pages !== null) {
    //     pages = pages.pages;
    //     if (pages !== null) {
    //       this.setState({ previousPage: pages[0] });
    //     }
    //   }
    // }
    let stream = this.props.stream;
    const videoGrid = document.getElementById("video-grid");
    const screenShareGrid = document.getElementById("screenShare-grid");
    //chrome://settings/content/camera for choosing source of video signal
    // let stream = await navigator.mediaDevices.getUserMedia({
    //     video: false,
    //     audio: true,
    // });
    // stream.getAudioTracks()[0].enabled = false;
    // if (stream.getVideoTracks()[0].enabled === false) {
    //     this.setState({ tools: [false, true] });
    // }
    if (stream.getAudioTracks()[0].enabled === false) {
      this.setState({ tools: [true, false] });
    }
    if (this.state.tools[0] === false && this.state.tools[1] === false) {
      this.popup();
      this.finishTheCall();
    }
    stream.streamtype = "myVideo";
    //stream.getVideoTracks()[0].enabled = false;

    // const myPeer = new Peer(undefined, {
    //     path: "/peerjs",
    //     host: "/",
    //     //port: "3443",
    //     port: "4000", //, for backup.server.js
    //     secure: true,
    // });

    this.setState({ myPeer: this.props.myPeer, videoGrid: videoGrid, screenShareGrid: screenShareGrid }, () => {
      const myVideo = document.createElement("video");
      myVideo.style = "display:none";
      myVideo.muted = true;
      let stm = null;
      try {
        this.props.myPeer.on("open", (id) => {
          console.log("join-room", id);
          var perfEntries = performance.getEntriesByType("navigation"); // for checking "reload" state of page
          if (perfEntries[0].type !== "reload") {
            if (this.props.sourceIdAndPeerIdForACall.length !== 0 && this.props.sourceIdAndPeerIdForACall[0] !== null) {
              this.setState({ peerId: this.props.sourceIdAndPeerIdForACall[1] });
              this.props.websocket.send(
                JSON.stringify({
                  event: "IncomingCallAccept",
                  payload: JSON.stringify({
                    sourceId: this.props.sourceIdAndPeerIdForACall[0],
                    sourcePeerId: this.props.sourceIdAndPeerIdForACall[1],
                    receiverId: this.props.sourceIdAndPeerIdForACall[2],
                    peerId: id,
                  }),
                })
              );
              dispatcher("setSourceIdAndPeerIdForACall", { action: [], type: "" });
            } else {
              this.props.websocket.send(
                JSON.stringify({
                  event: "webRTCCall",
                  payload: JSON.stringify({ receiverId: this.props.callId, peerId: id }),
                })
              );
            }
          }
          if (perfEntries[0].type === "reload") {
            this.props.websocket.send(
              JSON.stringify({
                event: "restoreConnection",
                payload: JSON.stringify({ receiverId: this.props.callId, sourcePeerId: id }),
              })
            );
          }
        });
        this.addVideoStream(myVideo, stream, this.state.videoGrid);

        stm = stream;
        this.setState({ stm: stm });

        console.log("stream", stream);
        this.props.myPeer.on("call", (call) => {
          if (call.options.metadata !== null && call.options.metadata === "1") {
            call.answer(stream);

            // const video = document.createElement("video");
            call.on("stream", (userVideoStream) => {
              //userVideoStream.streamtype = "notMyVideo";
              //this.addVideoStream(null, userVideoStream, this.state.videoGrid);
              userVideoStream.streamtype = "notMyVideo";
              const videoGrid = document.getElementById("video-grid");
              const video = document.createElement("video");
              video.style = "display:none";
              this.addVideoStream(video, userVideoStream, videoGrid);
            });

            console.log("myPeerOn");
          } else {
            call.answer();
            const share = document.createElement("video");
            call.on("stream", (userVideoStream) => {
              userVideoStream.streamtype = "notMyScreen";
              this.addVideoStream(share, userVideoStream, this.state.screenShareGrid);
            });
            console.log("myPeerOn");
          }
        });
      } catch (e) {
        dispatcher("setError", { action: e.message, type: "" });
      }
    });
  }

  async componentDidUpdate(prevProps, prevState) {
    //Change this 2 elems to the real case multiples.
    // if (prevProps.videoBlocks.length !== this.props.videoBlocks.length && this.props.videoBlocks.length !== 0) {
    if (
      (prevProps.streamBlocks.length !== this.props.streamBlocks.length && this.props.streamBlocks.length !== 0 && this.props.videoBlocks.length !== 0) ||
      (prevProps.videoBlocks.length !== this.props.videoBlocks.length && this.props.videoBlocks.length !== 0 && this.props.streamBlocks.length !== 0)
    ) {
      let storeState = store.getState();
      if (storeState.streamBlocks.length < 2) {
        this.addVideoStream(
          this.props.videoBlocks[0],
          storeState.streamBlocks.find((x) => x.streamtype === "myVideo"),
          null,
          true
        );
      } else if (storeState.streamBlocks.length === 2) {
        this.addVideoStream(
          this.props.videoBlocks[0],
          storeState.streamBlocks.find((x) => x.streamtype === "myVideo"),
          null,
          true
        );
        this.addVideoStream(
          this.props.videoBlocks[1],
          storeState.streamBlocks.find((x) => x.streamtype === "notMyVideo"),
          null,
          true
        );
      } else if (storeState.streamBlocks.length === 3) {
        this.addVideoStream(
          this.props.videoBlocks[0],
          storeState.streamBlocks.find((x) => x.streamtype === "myVideo"),
          null,
          true
        );
        this.addVideoStream(
          this.props.videoBlocks[1],
          storeState.streamBlocks.find((x) => x.streamtype === "notMyVideo"),
          null,
          true
        );
        this.addVideoStream(
          this.props.videoBlocks[2],
          storeState.streamBlocks.find((x) => x.streamtype === "myScreen"),
          null,
          true
        );
      }
    }
    if (prevProps.websocketResponse !== this.props.websocketResponse && this.props.websocketResponse != null) {
      let data = JSON.parse(this.props.websocketResponse);

      console.log(data);
      if (data.event === "IncomingCallReject") {
        let payload = JSON.parse(data.payload);
        alert(`${payload.receiverName} сбросил вызов`);
        this.props.history.push(`/friends/friendlist`);
      }
      if (data.event === "SendPeerToSource") {
        let payload = JSON.parse(data.payload);
        this.setState({ peerId: payload.peerId });
        this.connectToNewUser(payload.peerId, this.state.stm, 1);
      }
      if (data.event === "lostConnection") {
        let f = 1;
      }
      if (data.event === "finishTheCall") {
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
        // this.popup();
        // if (window.history.prevPage !== undefined) {
        //   this.props.history.goBack();
        // } else {
        //   this.props.history.push("/");
        // }
        // this.props.history.finishTheCall = true;
      }
      if (data.event === "disableShareScreen") {
        let screen = this.state.streamBlocks.find((streamBlocks) => streamBlocks.streamtype === "notMyScreen");
        this.state.streamBlocks.splice(this.state.streamBlocks.indexOf(screen), 1);
        this.setState({ streamBlocks: this.state.streamBlocks });
      }
      if (data.event === "restoreConnection") {
        let payload = JSON.parse(data.payload);
        let screen = this.state.streamBlocks.find((streamBlocks) => streamBlocks.streamtype === "notMyScreen");
        if (screen !== null) {
          this.state.streamBlocks.splice(this.state.streamBlocks.indexOf(screen), 1);
          this.setState({ streamBlocks: this.state.streamBlocks });
        }
        this.props.websocket.send(
          JSON.stringify({
            event: "sendIdForRestore",
            payload: JSON.stringify({ sourceId: this.props.callId, sourcePeerId: payload.sourcePeerId, receiverId: payload.receiverId, receiverPeerId: this.state.myPeer._id }),
          })
        );
        this.setState({ peerId: payload.sourcePeerId });
        this.connectToNewUser(payload.sourcePeerId, this.state.stm, 1);
      }
      dispatcher("setWebsocketResponse", { action: null, type: "" });

      if (this.state.streamBlocks !== prevProps.streamBlocks) {
        console.log(1);
      }
    }
    if (this.props.screenStream === true) {
      this.connectToNewUser(this.state.peerId, null, 2);
      dispatcher("setScreenStream", { action: false, type: "" });
    }
  }

  componentWillUnmount() {
    // if (this.state.stm !== null) {
    //     this.state.stm.getTracks().forEach(function (track) {
    //         track.stop();
    //     });
    // }
    // if (this.state.screenStm !== null) {
    //     this.state.screenStm.getTracks().forEach(function (track) {
    //         track.stop();
    //     });
    // }
    // if (this.props.history.finishTheCall === undefined || this.props.history.finishTheCall === false) {
    //     this.props.websocket.send(
    //         JSON.stringify({
    //             event: "finishTheCall",
    //             payload: JSON.stringify({ callMemberId: this.props.callId }),
    //         })
    //     );
    // }
    // this.props.history.finishTheCall = false;
    ///////////
    // call.on("close", () => {
    //   //video.remove();
    // });
    // if (this.state.peerId !== null) {
    //   this.setState({ peerId: null });
    // }
  }
  soundMute = () => {
    let enabled = this.state.stm.getAudioTracks()[0].enabled;
    if (enabled) {
      this.state.stm.getAudioTracks()[0].enabled = false;
    } else {
      this.state.stm.getAudioTracks()[0].enabled = true;
    }
  };
  videoMute = () => {
    let enabled = this.state.stm.getVideoTracks()[0].enabled;
    if (enabled) {
      this.state.stm.getVideoTracks()[0].enabled = false;
    } else {
      this.state.stm.getVideoTracks()[0].enabled = true;
    }
  };
  shareScreen = async () => {
    if (this.state.screenStm == null) {
      //this.setState({ screenShareGrid: screenShareGrid });
      this.connectToNewUser(this.state.peerId, null, 2);
    } else {
      this.state.screenStm.getTracks().forEach(function (track) {
        track.stop();
      });
      this.setState({ screenStm: null });
      let screen = this.state.streamBlocks.find((streamBlocks) => streamBlocks.streamtype === "myScreen");
      this.state.streamBlocks.splice(this.state.streamBlocks.indexOf(screen), 1);
      this.setState({ streamBlocks: this.state.streamBlocks }, () => {
        dispatcher("setStreamBlocks", { action: this.state.streamBlocks, type: "" });
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
    // if (this.state.previousPage !== null) {
    //this.props.history.push(this.state.previousPage);
    if (window.history.prevPage !== undefined) {
      this.props.history.goBack();
    } else {
      this.props.history.push("/");
    }
    //}
  }
  popup() {
    var modal = document.getElementById("myModal");
    var span = document.getElementsByClassName("close")[0];
    modal.style.display = "block";
    span.onclick = function () {
      modal.style.display = "none";
    };
    window.onclick = function (event) {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    };
  }
  async connectToNewUser(userId, stream, streamtype) {
    if (streamtype === 1) {
      let options = { metadata: "1" };

      const call = this.state.myPeer.call(userId, stream, options);

      // const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        userVideoStream.streamtype = "notMyVideo";
        const videoGrid = document.getElementById("video-grid");
        const video = document.createElement("video");
        video.style = "display:none";
        this.addVideoStream(video, userVideoStream, videoGrid);
        //this.addVideoStream(null, userVideoStream, this.state.videoGrid);
        // this.addVideoStream(null, userVideoStream, this.state.videoGrid);
      });
      call.on("close", () => {
        //video.remove();
      });
    } else {
      let captureStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      //this.setState({ screenStm: captureStream });
      let options = { metadata: "2" };
      const call = this.state.myPeer.call(userId, captureStream, options);
      // const video = document.createElement("video");
      captureStream.streamtype = "myScreen";
      const videoGrid = document.getElementById("video-grid");
      const video = document.createElement("video");
      video.style = "display:none";
      this.addVideoStream(video, captureStream, videoGrid);

      call.on("close", () => {
        //video.remove();
      });
    }
  }

  addVideoStream(video, stream, elementGrid, isVidProps = false) {
    let storeState = store.getState();
    let propsStreamBlocks = [...storeState.streamBlocks];
    let isStreamExists = propsStreamBlocks.find((x) => x.id === stream.id);
    if (isStreamExists === null || isStreamExists === undefined) {
      propsStreamBlocks.push(stream);
      dispatcher("setStreamBlocks", { action: propsStreamBlocks, type: "" });
    }
    if (video.srcObject === null) {
      if (video.id === "vid1" || video.id === "vid2" || video.id === "vid3") {
        video.srcObject = stream;
        video.addEventListener("loadedmetadata", () => {
          video.play();
        });
      } else {
        if (isStreamExists === null || isStreamExists === undefined) {
          video.srcObject = stream;
          video.addEventListener("loadedmetadata", () => {
            video.play();
          });
          if (!isVidProps) {
            elementGrid.append(video);
            stream.isBackground = true;
          }
        } else {
          if (isStreamExists.isBackground !== undefined && isStreamExists.isBackground === false) {
            video.srcObject = isStreamExists;
            video.addEventListener("loadedmetadata", () => {
              video.play();
            });
            if (!isVidProps) {
              elementGrid.append(video);
              isStreamExists.isBackground = true;
            }
          }
        }
      }
    }
  }
  // addVideoStream(video, stream, elementGrid) {
  //     video.srcObject = stream;
  //     video.addEventListener("loadedmetadata", () => {
  //         video.play();
  //     });
  //     elementGrid.append(video);
  // }
  render() {
    // if (this.state.previousPage !== "/friends/friendlist") {
    //   return "You're not allowed to visit this page...";
    // } else
    if (1) {
      return null;
    }
    if (this.state.streamBlocks.length < 2 && this.state.streamBlocks.length > 0) {
      return (
        <div>
          {/* <div id="video-grid"> */}
          {/* {this.state.streamBlocks.map((s) => (
                                <VideoCall stream={s} />
                            ))} */}
          <Loader />
          {/* </div> */}

          {/* <div id="screenShare-grid"> </div> */}
          <div>
            <div>
              {this.state.tools[0] === true && <h>{<button onClick={this.videoMute.bind(this)}>videoMute</button>}</h>}
              {this.state.tools[1] === true && <h>{<button onClick={this.soundMute.bind(this)}>soundMute</button>}</h>}
            </div>
            <button onClick={this.shareScreen.bind(this)}>shareScreen</button>
            <button onClick={this.finishTheCall.bind(this)}>finish the call</button>
          </div>
        </div>
      );
    } else {
      return (
        <div>
          {/* <div id="video-grid">
                            {this.state.streamBlocks.map((s) => (
                                <VideoCall stream={s} />
                            ))}
                        </div> */}

          {/* <div id="screenShare-grid"> </div> */}
          <div>
            {this.state.tools[0] === true && <h>{<button onClick={this.videoMute.bind(this)}>videoMute</button>}</h>}
            {this.state.tools[1] === true && <h>{<button onClick={this.soundMute.bind(this)}>soundMute</button>}</h>}
            <button onClick={this.shareScreen.bind(this)}>shareScreen</button>
            <button onClick={this.finishTheCall.bind(this)}>finish the call</button>
          </div>
        </div>
      );
    }
  }
}
function mapStateToProps(state) {
  return {
    token: state.token,
    isAuth: state.isAuth,
    websocket: state.websocket,
    websocketResponse: state.websocketResponse,
    error: state.error,
    sourceIdAndPeerIdForACall: state.sourceIdAndPeerIdForACall,
    stream: state.stream,
    myPeer: state.myPeer,
    callId: state.callId,
    streamBlocks: state.streamBlocks,
    videoBlocks: state.videoBlocks,
    screenStream: state.screenStream,
  };
}

// export default withRouter(connect(mapStateToProps)(WebRTCCall));
export default connect(mapStateToProps)(WebRTCCall);
