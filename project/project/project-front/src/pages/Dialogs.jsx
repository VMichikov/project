import React, { Component } from "react";
import { dispatcher } from "../redux/redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import utils from "../utils/utils";
import Error from "./Error";

class Dialogs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dialogs: [],
      isLoading: true,
    };
    //this.connection = this.connection.bind(this);
  }

  async componentDidMount() {
    //if (window.history !== null) {
    //window.history.prevPage = this.props.location.pathname;
    //}
    utils.savePagePathToLocalStorage(this.props.location.pathname);
    //Do I really need this here?
    if (this.props.isAuth !== null && !this.props.isAuth) {
      this.setState({ isLoading: false });
    }
    //Can be null at the moment of mounting
    if (this.props.websocket != null) {
      let isConnectionEstablished = await utils.connection(this.props.websocket);
      if (isConnectionEstablished) {
        this.props.websocket.send(JSON.stringify({ event: "listDialogs" }));
      }
    }
  }
  showDialog(id, e) {
    this.props.history.push(`/dialogs/${id}`);
  }
  async componentDidUpdate(prevProps, prevState) {
    //In case the web app was not loaded and authorized already on the other component
    if (prevProps.isAuth === null && this.props.isAuth !== null && !this.props.isAuth) {
      this.setState({ isLoading: false });
    }
    if (prevProps.websocketResponse !== this.props.websocketResponse && this.props.websocketResponse != null) {
      //console.log(this.props.websocketResponse);
      if (JSON.parse(this.props.websocketResponse).event === "listDialogs") {
        let res = JSON.parse(JSON.parse(this.props.websocketResponse).payload);
        dispatcher("setWebsocketResponse", { action: null, type: "" }); //Do I really need it?
        let dialogs = res.map((item) => {
          return [item.user_id, item.username, item.email, item.phone, item.is_premium, item.is_deleted, item.last_active, item.avatar_id, item.status, item.status_message];
        });
        //console.log(dialogs);
        this.setState({ dialogs: dialogs, isLoading: false });
      }
    }
    //I need this because ws can be eq null and then be established with the localStorage's token
    if (prevProps.websocket !== this.props.websocket && this.props.websocket != null) {
      let isConnectionEstablished = await utils.connection(this.props.websocket);
      if (isConnectionEstablished) {
        this.props.websocket.send(JSON.stringify({ event: "listDialogs" }));
      }
    }
  }
  componentWillUnmount() {
    dispatcher("setLeftBarList", { action: null, type: "" });
  }
  render() {
    if (this.props.error === null) {
      if (this.state.isLoading || this.props.isAuth === null) {
        return <div>Loading ... </div>;
      } else {
        if (this.props.isAuth) {
          let dialogs = null;
          if (this.state.dialogs != null) {
            dialogs = this.state.dialogs.map((item) => {
              return (
                // <li key={item[0]} onClick={this.showDialog.bind(this, item[0])}>
                //     userId {item[0]}, username {item[1]}, email {item[2]}, phone {item[3]}, isPremium {item[4]}, isDeleted {item[5]}, lastActive {item[6]}, avatarId {item[7]}, status {item[8]}
                //     , statusMessage {item[9]}
                // </li>
                <li key={item[0]} onClick={this.showDialog.bind(this, item[0])}>
                  avatarId {item[7]} {item[1]}
                </li>
              );
            });
            dispatcher("setLeftBarList", { action: dialogs, type: "" });
          }
          //console.log(dialogs);
          return null;
          //     <div>
          //         Dialogs list
          //         {dialogs}
          //     </div>
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
    websocketResponse: state.websocketResponse,
    error: state.error,
  };
}

export default withRouter(connect(mapStateToProps)(Dialogs));
