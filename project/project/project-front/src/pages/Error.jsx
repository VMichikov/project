import React, { Component } from "react";
import { dispatcher } from "../redux/redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";

class Error extends Component {
  constructor(props) {
    super(props);
  }
  openLogInPage() {
    this.props.history.push(`/startpage`);
    //dispatcher("setError", { action: null, type: "" });
  }
  render() {
    let errorMessage = "";
    if (this.props.error === "wrong_token") {
      errorMessage = "Incorrect token, please, log in again!";
    } else if (this.props.error === "cannot_establish_connection") {
      errorMessage = "Something wrong with our server, please try again later!";
    } else {
      errorMessage = this.props.error;
    }
    if (this.props.error != null) {
      return (
        <div>
          {errorMessage}
          <br />
          {this.props.error === "wrong_token" && !this.props.history.location.pathname.includes("/startpage") ? <button onClick={this.openLogInPage.bind(this)}>Start page</button> : null}
        </div>
      );
    } else {
      return null;
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

export default withRouter(connect(mapStateToProps)(Error));
