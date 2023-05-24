import React, { Component } from "react";
//import { dispatcher } from "../redux/redux";
import { connect } from "react-redux";
import Error from "./Error";
import { withRouter } from "react-router";

class StartPage extends Component {
  constructor(props) {
    super(props);
    //this.state = { friends: [], isLoading: true };
  }

  showLogin(id, e) {
    this.props.history.push(`/startpage/login`);
  }
  showSignUp(id, e) {
    this.props.history.push(`/startpage/signup`);
  }

  render() {
    if (this.props.isAuth === null) {
      if (this.props.error === null) {
        return <div>Loading ... </div>;
      } else {
        return <Error />;
      }
    } else {
      if (this.props.error === null || this.props.error === "wrong_token") {
        //   if (this.state.isLoading || this.props.isAuth === null) {
        //     return <div>Loading ... </div>;
        //   }

        return (
          <div>
            <li key={1} onClick={this.showLogin.bind(this)}>
              Login
            </li>

            <li key={2} onClick={this.showSignUp.bind(this)}>
              SignUp
            </li>
          </div>
        );

        //  }
      } else {
        return <Error />;
      }
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

export default withRouter(connect(mapStateToProps)(StartPage));
