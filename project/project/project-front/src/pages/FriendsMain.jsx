import React, { Component } from "react";
import { dispatcher } from "../redux/redux";
import { connect } from "react-redux";
import Error from "./Error";
import utils from "../utils/utils";
import { withRouter } from "react-router";

class FriendsMain extends Component {
  constructor(props) {
    super(props);
    this.logOut = this.logOut.bind(this);
    //this.state = { friends: [], isLoading: true };
  }
  logOut() {
    this.props.websocket.close();
    dispatcher("setWebsocket", { action: null, type: "" });
    dispatcher("isNotAuthorized");
    localStorage.removeItem("token");
  }

  showFriendList(id, e) {
    this.props.history.push(`/friends/friendlist`);
  }
  showFriendRequests(id, e) {
    this.props.history.push(`/friends/friendrequests`);
  }
  showFriendResponses(id, e) {
    this.props.history.push(`/friends/friendresponses`);
  }
  async componentDidMount() {
    utils.savePagePathToLocalStorage(this.props.location.pathname);
  }
  render() {
    if (this.props.error === null) {
      //   if (this.state.isLoading || this.props.isAuth === null) {
      //     return <div>Loading ... </div>;
      //   } else {
      if (this.props.isAuth) {
        return (
          <div>
            <li key={1} onClick={this.showFriendList.bind(this)}>
              FriendList
            </li>

            <li key={2} onClick={this.showFriendRequests.bind(this)}>
              FrendRequests
            </li>

            <li key={3} onClick={this.showFriendResponses.bind(this)}>
              FrendResponses
            </li>
          </div>
        );
      } else {
        return <div>Вы не авторизованы</div>;
      }
      //  }
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

export default withRouter(connect(mapStateToProps)(FriendsMain));
