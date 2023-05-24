import React, { Component } from "react";
// import { Redirect } from "react-router-dom";
import { dispatcher } from "../redux/redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import Error from "./Error";

class Login extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChangeUsername = this.handleChangeUsername.bind(this);
    this.handleChangePassword = this.handleChangePassword.bind(this);
    this.handleChangeEmail = this.handleChangeEmail.bind(this);
    this.state = {
      username: "",
      password: "",
      email: "",
    };
  }

  async handleSubmit(e) {
    localStorage.removeItem("token");
    e.preventDefault();
    let requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: this.state.username, password: this.state.password, email: this.state.email }),
    };
    let response = await fetch("http://localhost:4000/api/auth/signup", requestOptions);
    let data = await response.json();
    if (response.status === 200) {
      this.setState({ username: "", password: "", email: "" });
      dispatcher("setError", { action: null, type: "" });
      dispatcher("setToken", { action: data.token, type: "" });
      console.log(data.token); //Delete on production
      localStorage.setItem("token", data.token);
    } else {
      dispatcher("setError", { action: data.error, type: "" });
      dispatcher("setToken", { action: null, type: "" });
    }
  }
  handleChangeUsername(e) {
    this.setState({
      username: e.target.value,
    });
  }
  handleChangePassword(e) {
    this.setState({
      password: e.target.value,
    });
  }
  handleChangeEmail(e) {
    this.setState({
      email: e.target.value,
    });
  }
  //TODO: Error handling in this component
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.websocket !== this.props.websocket) {
      if (this.props.token != null && this.props.websocket != null) {
        this.props.history.push(`/protected`); //For redirecting after auth
      }
    }
  }
  componentWillUnmount() {
    if (this.props.error !== "wrong_token" && this.props.error !== "cannot_establish_connection") dispatcher("setError", { action: null, type: "" });
  }
  render() {
    if (this.props.isAuth === null) {
      if (this.props.error === null) {
        return <div>Loading ... </div>;
      } else {
        return <Error />;
      }
    } else {
      if (this.props.isAuth) {
        return <div>Вы уже авторизованы</div>;
      } else {
        return (
          <div>
            <form onSubmit={this.handleSubmit}>
              <label htmlFor="fname">Login:</label> <br />
              <input onChange={this.handleChangeUsername} type="text" id="fname" name="fname" value={this.state.username} />
              <br />
              <label htmlFor="lname">Password:</label>
              <br />
              <input onChange={this.handleChangePassword} type="text" id="lname" name="lname" value={this.state.password} />
              <br />
              <label htmlFor="lname">Email:</label>
              <br />
              <input onChange={this.handleChangeEmail} type="text" id="lname" name="lname" value={this.state.email} />
              <br />
              <input type="submit" value="Submit" />
            </form>
            <br />
            <Error />
          </div>
        );
      }
    }
  }
}
function mapStateToProps(state) {
  return {
    token: state.token,
    isAuth: state.isAuth,
    websocket: state.websocket,
    error: state.error,
  };
}

export default withRouter(connect(mapStateToProps)(Login));
