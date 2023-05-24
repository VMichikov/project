import React, { Component } from "react";
import { dispatcher } from "../redux/redux";
import { connect } from "react-redux";
import { BrowserRouter as Router, Route, Link, Redirect, BrowserHistory, Switch } from "react-router-dom";
import Home from "../pages/Home";
import FriendsMain from "../pages/FriendsMain";
import FriendList from "../pages/FriendList";
import FriendRequests from "../pages/FriendRequests";
import FriendResponses from "../pages/FriendResponses";
import Login from "../pages/Login";
import Dialogs from "../pages/Dialogs";
import Dialog from "../pages/Dialog";
import Files from "../pages/Files";
import StartPage from "../pages/StartPage";
import SignUp from "../pages/SignUp";
import { GlobalHistory } from "./history";

class RightBar extends Component {
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
        <div className="rightBar">
          <Router>
            <div>
              <Switch>
                <Route exact path="/startpage">
                  <StartPage />
                </Route>
                <Route exact path="/startpage/signup">
                  <SignUp />
                </Route>
                <Route exact path="/startpage/login">
                  <Login />
                </Route>
                {/* {this.props.websocket != null ? <Redirect to="/protected" /> : null} */}
                {/* {this.props.websocket == null ? <Redirect to="/" /> : null} */}
                {/* <PrivateRoute path="/protected" component={Home} isAuth={this.props.isAuth} /> */}

                <Route exact path="/protected">
                  <Home />
                </Route>
                <Route exact path="/friends">
                  <FriendsMain />
                </Route>
                <Route exact path="/friends/friendlist">
                  <FriendList />
                </Route>
                <Route exact path="/friends/friendrequests">
                  <FriendRequests />
                </Route>
                <Route exact path="/friends/friendresponses">
                  <FriendResponses />
                </Route>
                <Route exact path="/dialogs">
                  <Dialogs dialogs />
                </Route>
                <Route exact path="/files">
                  <Files />
                </Route>
                <Route path="/dialogs/:id" component={Dialog} />
                {/* <Route
                            exact
                            path="*"
                            render={() => {
                                return this.props.websocket != null ? <Redirect to="/protected" /> : <Redirect to="/login" />;
                            }}
                        /> */}
                {/* <Route path="*">
                        <Redirect to="/" />
                    </Route> */}
              </Switch>
            </div>
            <GlobalHistory />
          </Router>
        </div>
      );
    } else {
      return (
        <div className="rightBar">
          <Router>
            <div>
              <Switch>
                <Route exact path="/startpage">
                  <StartPage />
                </Route>
                <Route exact path="/startpage/signup">
                  <SignUp />
                </Route>
                <Route exact path="/startpage/login">
                  <Login />
                </Route>
              </Switch>
            </div>
            <GlobalHistory />
          </Router>
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
  };
}

export default connect(mapStateToProps)(RightBar);
