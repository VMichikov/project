import React, { Component } from "react";
import { dispatcher } from "../redux/redux";
import { connect } from "react-redux";

class Home extends Component {
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
  render() {
    if (this.props.isAuth) {
      return (
        <div>
          Home!
          <button onClick={this.logOut}>Log out</button>
        </div>
      );
    } else {
      return <div>Вы не авторизованы</div>;
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

export default connect(mapStateToProps)(Home);
