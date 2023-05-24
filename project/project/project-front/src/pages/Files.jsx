import React, { Component } from "react";
import { dispatcher } from "../redux/redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import utils from "../utils/utils";
import Error from "./Error";
import UploadFile from "./UploadFile";

class Files extends Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      isLoading: true,
    };
    this.readFileAsync = this.readFileAsync.bind(this);
    //this.connection = this.connection.bind(this);
  }

  async componentDidMount() {
    //setTimeout(() => {
    //this.props.history.goBack();
    // if (window.history.prevPage !== undefined) {
    //     this.props.history.goBack();
    // } else {
    //     this.props.history.push("/");
    // }
    //}, 1000);

    //alert(this.props.location.pathname);
    utils.savePagePathToLocalStorage(this.props.location.pathname);
    //Do I really need this here?
    if (this.props.isAuth !== null && !this.props.isAuth) {
      this.setState({ isLoading: false });
    }
    //Can be null at the moment of mounting
    if (this.props.websocket != null) {
      let isConnectionEstablished = await utils.connection(this.props.websocket);
      if (isConnectionEstablished) {
        this.props.websocket.send(JSON.stringify({ event: "listFiles" }));
      }
    }
  }
  async componentDidUpdate(prevProps, prevState) {
    //In case the web app was not loaded and authorized already on the other component
    if (prevProps.isAuth === null && this.props.isAuth !== null && !this.props.isAuth) {
      this.setState({ isLoading: false });
    }
    if (prevProps.websocketResponse !== this.props.websocketResponse && this.props.websocketResponse != null) {
      //console.log(this.props.websocketResponse);
      if (JSON.parse(this.props.websocketResponse).event === "listFiles") {
        let res = JSON.parse(JSON.parse(this.props.websocketResponse).payload);
        dispatcher("setWebsocketResponse", { action: null, type: "" }); //Do I really need it? I probably cause the odd rerender
        let files = res.map((item) => {
          return [item.id, item.hash, item.name, item.extention];
        });
        //console.log(dialogs);
        this.setState({ files: files, isLoading: false });
      }
    }
    //I need this because ws can be eq null and then be established with the localStorage's token
    if (prevProps.websocket !== this.props.websocket && this.props.websocket != null) {
      let isConnectionEstablished = await utils.connection(this.props.websocket);
      if (isConnectionEstablished) {
        this.props.websocket.send(JSON.stringify({ event: "listFiles" }));
      }
    }
  }

  readFileAsync(blob, reader) {
    return new Promise((resolve, reject) => {
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(blob);
    });
  }

  async downloadFile(hash, name, extention, e) {
    let filePrefix;
    if (extention === "") {
      filePrefix = name;
    } else {
      filePrefix = `${name}.${extention}`;
    }
    let filesToDownload = [
      {
        //TODO:change the string adress to the the global var from the config.json or smth like that.
        //url: "https://localhost:4000/api/auth/aaa.js",

        filePrefix: filePrefix,
        path: "",
        name: filePrefix,
        requestInit: { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: this.props.token, fileHash: hash }) },
      },
    ];
    if (this.props.error != null) {
      dispatcher("setError", { action: null, type: "" });
    }
    dispatcher("setFilesToDownload", { action: filesToDownload, type: "" });
  }
  async removeFile(fileName, fileExtention, fileHash, e) {
    let notificationsList = [...this.props.notificationsList];

    dispatcher("setNotificationsList", { action: notificationsList, type: "" });
    dispatcher("setNotificationsCounter", { action: this.props.notificationsCounter + 1, type: "" });
  }
  render() {
    //if (this.props.error === null) {
    if (this.state.isLoading || this.props.isAuth === null) {
      return <div>Loading ... </div>;
    } else {
      if (this.props.isAuth) {
        let files = null;
        if (this.state.files != null) {
          files = this.state.files.map((item) => {
            return (
              // <li key={item[0]} onClick={this.showDialog.bind(this, item[0])}>
              //     userId {item[0]}, username {item[1]}, email {item[2]}, phone {item[3]}, isPremium {item[4]}, isDeleted {item[5]}, lastActive {item[6]}, avatarId {item[7]}, status {item[8]}
              //     , statusMessage {item[9]}
              // </li>
              <div>
                <li key={item[0]} onClick={this.downloadFile.bind(this, item[1], item[2], item[3])}>
                  id: {item[0]}, hash: {item[1]} name: {item[2]} extention: {item[3]}
                </li>
                <button onClick={this.removeFile.bind(this, item[2], item[3], item[1])}>Remove</button>
              </div>
            );
          });
        }

        //console.log(dialogs);
        return (
          <div>
            Files list
            {files}
            <br />
            {this.state.isKeysListExists ? <button onClick={this.downloadKeysList.bind(this)}>Download keys list</button> : null}
            <br />
            <input type="file" id="keysList" name="file" style={{ display: "none" }} />
            <label htmlFor="keysList" style={{ background: "white", padding: "1px 1px", border: "solid 1px" }}>
              Choose file
            </label>
            <br />
            {this.props.error !== null ? <Error /> : null}
            <br />
            <UploadFile />
          </div>
        );
      } else {
        return <div>Вы не авторизованы</div>;
      }
    }
    //} else {
    //     return <Error />;
    // }
  }
}
function mapStateToProps(state) {
  return {
    websocket: state.websocket,
    isAuth: state.isAuth,
    websocketResponse: state.websocketResponse,
    error: state.error,
    filesToDownload: state.filesToDownload,
    token: state.token,
    notificationsList: state.notificationsList,
    notificationsCounter: state.notificationsCounter,
  };
}

export default withRouter(connect(mapStateToProps)(Files));
