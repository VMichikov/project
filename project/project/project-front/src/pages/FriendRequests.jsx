import React, { Component } from "react";
import { dispatcher } from "../redux/redux";
import { connect } from "react-redux";
import utils from "../utils/utils";
import Error from "./Error";

class FriendRequests extends Component {
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

  async componentDidMount() {
    if (this.props.isAuth !== null && !this.props.isAuth) {
      this.setState({ isLoading: false });
    }
    if (this.props.websocket != null) {
      let isConnectionEstablished = await utils.connection(this.props.websocket);
      if (isConnectionEstablished) {
        this.props.websocket.send(
          JSON.stringify({
            event: "friendRequests",
          })
        );
        let response = await utils.getWsResponse(this.props.websocket, "friendRequests");
        let res = JSON.parse(response).map((item) => {
          return [item[0]];
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
            event: "friendRequests",
          })
        );
        let response = await utils.getWsResponse(this.props.websocket, "friendRequests");
        let res = JSON.parse(response).map((item) => {
          return [item[0]];
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
            friends = this.state.friends.map((item) => {
              return <li>{item}</li>;
            });
            return (
              <>
                Your Requests:
                {friends}
                <button onClick={this.logOut}>Log out</button>
              </>
            );
          } else {
            return (
              <>
                Что-то пошло не так
                <button onClick={this.logOut}>Log out</button>
              </>
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

export default connect(mapStateToProps)(FriendRequests);
