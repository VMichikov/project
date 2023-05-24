import React, { Component } from "react";
import { dispatcher } from "../redux/redux";
import { connect } from "react-redux";
import utils from "../utils/utils";
import Error from "./Error";

class FriendResponses extends Component {
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
  addFriend(friendId, e) {
    this.props.websocket.send(
      JSON.stringify({
        event: "approveFriend",
        payload: JSON.stringify({ friendId: friendId }),
      })
    );
  }
  removeFriend(friendId, e) {
    this.props.websocket.send(
      JSON.stringify({
        event: "deleteFriend",
        payload: JSON.stringify({ friendId: friendId }),
      })
    );
  }
  async componentDidMount() {
    if (this.props.isAuth !== null && !this.props.isAuth) {
      this.setState({ isLoading: false });
    }
    if (this.props.websocket != null) {
      let isConnectionEstablished = await utils.connection(this.props.websocket);
      if (isConnectionEstablished) {
        this.props.websocket.send(
          JSON.stringify({
            event: "friendResponses",
          })
        );
        let response = await utils.getWsResponse(this.props.websocket, "friendResponses");
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
    if (this.state.friends.length !== 0) {
      if (prevProps.websocketResponse !== this.props.websocketResponse && this.props.websocketResponse != null) {
        let data = JSON.parse(this.props.websocketResponse);
        dispatcher("setWebsocketResponse", { action: null, type: "" });
        console.log(data);
        if (data.event === "approveFriendResponse" || data.event === "deleteFriendResponse") {
          let friend = JSON.parse(data.payload);
          let friends = this.state.friends;
          friends = friends.filter((item) => item[1] !== friend.friendId);
          this.setState({ friends: friends });
        }
      }
    } else if (this.state.friends.length === 0) {
      //I need this because ws can be eq null and then be established with the localStorage's token
      if (prevProps.websocket !== this.props.websocket && this.props.websocket != null) {
        this.props.websocket.send(
          JSON.stringify({
            event: "friendResponses",
          })
        );
        let response = await utils.getWsResponse(this.props.websocket, "friendResponses");
        let res = JSON.parse(response).map((item) => {
          return [item[0], item[1]];
        });
        this.setState({ friends: res, isLoading: false });
      }
    }
  }
  render() {
    if (this.props.error === null) {
      if (this.state.isLoading || this.props.isAuth === null) {
        return <div>Loading ... </div>;
      } else {
        if (this.props.isAuth) {
          let friends = null;
          if (this.state.friends.length !== 0) {
            friends = this.state.friends.map((item /*, _index*/) => {
              return (
                <div /*key={_index} try it if front doesn't work as it should*/>
                  <li>{item[0]}</li>
                  <button onClick={this.addFriend.bind(this, item[1])}>Add</button>
                  <button onClick={this.removeFriend.bind(this, item[1])}>Remove</button>
                </div>
              );
            });
            return (
              <div>
                Your Responces:
                {friends}
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
    websocketResponse: state.websocketResponse,
    isAuth: state.isAuth,
    error: state.error,
  };
}

export default connect(mapStateToProps)(FriendResponses);
