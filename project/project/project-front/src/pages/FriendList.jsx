import React, { Component } from "react";
import { dispatcher } from "../redux/redux";
import { connect } from "react-redux";
import utils from "../utils/utils";
import Error from "./Error";
import { withRouter } from "react-router";
import Peer from "peerjs";
import getHistory from "../components/history";

class FriendList extends Component {
  constructor(props) {
    super(props);
    this.logOut = this.logOut.bind(this);
    this.state = { friends: [], isLoading: true };
  }
  logOut() {
    this.props.websocket.close();
    dispatcher("setWebsocket", { action: null, type: "" });
    dispatcher("isNotAuthorized");
    localStorage.removeItem("token");
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
      getHistory().push(`/dialogs/${friendId}`);
      //this.props.history.push(`/friendlist/webRTCCall/${friendId}`);
    }
  }
  async componentDidMount() {
    utils.savePagePathToLocalStorage(this.props.location.pathname);
    if (this.props.isAuth !== null && !this.props.isAuth) {
      this.setState({ isLoading: false });
    }
    if (this.props.websocket != null) {
      let isConnectionEstablished = await utils.connection(this.props.websocket);
      if (isConnectionEstablished) {
        this.props.websocket.send(
          JSON.stringify({
            event: "listFriends",
          })
        );
        let response = await utils.getWsResponse(this.props.websocket, "listFriends");
        let res = JSON.parse(response).map((item) => {
          return [item[0], item[1]];
        });
        this.setState({ friends: res, isLoading: false });
      }
    }
  }
  async componentDidUpdate(prevProps, prevState) {
    if (prevProps.isAuth === null && this.props.isAuth !== null && !this.props.isAuth) {
      this.setState({ isLoading: false });
    }
    if (this.state.friends.length === 0) {
      //I need this because ws can be eq null and then be established with the localStorage's token
      if (prevProps.websocket !== this.props.websocket && this.props.websocket != null) {
        this.props.websocket.send(
          JSON.stringify({
            event: "listFriends",
          })
        );
        let response = await utils.getWsResponse(this.props.websocket, "listFriends");
        let res = JSON.parse(response).map((item) => {
          return [item[0], item[1]];
        });
        this.setState({ friends: res, isLoading: false });
      }
    }
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
  render() {
    if (this.props.error === null) {
      if (this.state.isLoading || this.props.isAuth === null) {
        return <div>Loading ... </div>;
      } else {
        if (this.props.isAuth) {
          let friends = null;
          if (this.state.friends.length !== 0) {
            friends = this.state.friends.map((item) => {
              return (
                <div /*If something goes wrong, try (_index) from the same place in FriendResponses */>
                  <li>{item[0]}</li>
                  <button onClick={this.makeACall.bind(this, item[1])}>Make a Call</button>
                </div>
              );
            });
            return (
              <div>
                Friends:
                <br />
                {friends}
                <br />
                <button onClick={this.logOut}>Log out</button>
              </div>
            );
          } else {
            return (
              <div>
                Что-то пошло не так
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
    error: state.error,
  };
}

export default withRouter(connect(mapStateToProps)(FriendList));
