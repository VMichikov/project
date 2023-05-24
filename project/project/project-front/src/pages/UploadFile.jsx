import React, { Component } from "react";
import { dispatcher } from "../redux/redux";
import { connect } from "react-redux";
import utils from "../utils/utils";
// import * as serviceWorker from "./serviceWorker";
// Import your worker
//import worker from "workerize-loader!./UploadFileWorker"; // eslint-disable-line import/no-webpack-loader-syntax
//import worker from "worker-loader!./UploadFileWorker"; // eslint-disable-line import/no-webpack-loader-syntax
import { store } from "../redux/redux";
const config = require("../config.json");

if (!config["files"]) {
  console.error("config.json is not defined, maximum amount of uploading files is set to 3.");
}

class UploadFile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //entropy: [],
      notification: null,
      //This state.objectArray is necessary as an object for passing into the getServiceWorker function for its correct work.
      objectArray: [],
      numbers: 0,
    };
    this.logOut = this.logOut.bind(this);
    this.readFileAsync = this.readFileAsync.bind(this);
    //this.merge = this.merge.bind(this);
  }

  //TODO: send a request for deleting file chunks from server
  cancelUpload(fullName) {
    let uploadingFilesList = [...this.props.uploadingFilesList];
    uploadingFilesList = uploadingFilesList.filter((x) => x[0] !== fullName);
    let serviceWorkers = [...this.props.serviceWorker];
    let workerInstance = serviceWorkers.find((x) => x[0] === fullName);
    if (workerInstance !== null && workerInstance !== undefined) {
      workerInstance[1].terminate();
      serviceWorkers = serviceWorkers.filter((x) => x !== workerInstance);
      dispatcher("setServiceWorker", { action: serviceWorkers, type: "" });
    }
    if (this.props.uploadingFilesList.length !== uploadingFilesList.length) {
      dispatcher("setUploadingFilesList", { action: uploadingFilesList, type: "" });
    }
  }
  async uploadFile() {
    var files = document.getElementById("files").cloneNode(true).files;

    //It was designed for processing multiple files, but for now it is not being used.
    files = Object.entries(files);
    files = files.map((item) => {
      return item[1];
    });
    //Clear the file input.
    this.fileInput.value = "";
    let amountOfAlreadyUploadingFiles = 0;
    //Default value of max amount of uploading files.
    let maxAmountOfUploadingFiles = 3;
    if (config["files"]) {
      if (config["files"].maxAmountOfUploadingFiles !== null && config["files"].maxAmountOfUploadingFiles !== undefined && !isNaN(config["files"].maxAmountOfUploadingFiles)) {
        maxAmountOfUploadingFiles = config["files"].maxAmountOfUploadingFiles;
      }
    }
  }
  logOut() {
    this.props.websocket.close();
    dispatcher("setWebsocket", { action: null, type: "" });
    dispatcher("isNotAuthorized");
    localStorage.removeItem("token");
  }
  readFileAsync(blob, reader) {
    return new Promise((resolve, reject) => {
      reader.onload = () => {
        resolve(reader.result);
      };

      reader.onerror = reject;

      reader.readAsArrayBuffer(blob); //
    });
  }
  componentDidMount() {}
  componentDidUpdate(prevProps, prevState) {}

  render() {
    //if (this.props.isAuth) {
    return (
      <div>
        <input type="file" id="files" name="file" style={{ display: "none" }} onChange={this.uploadFile.bind(this)} ref={(ref) => (this.fileInput = ref)} />

        <br />
        <label htmlFor="files" style={{ background: "white", padding: "1px 1px", border: "solid 1px" }}>
          Upload
        </label>
        <br />
      </div>
    );
    // } else {
    //     return <div>Вы не авторизованы</div>;
    // }
  }
}
function mapStateToProps(state) {
  return {
    websocket: state.websocket,
    isAuth: state.isAuth,
    error: state.error,
    token: state.token,
    notificationsList: state.notificationsList,
    notificationsCounter: state.notificationsCounter,
    serviceWorker: state.serviceWorker,
    entropy: state.entropy,
    uploadingFilesList: state.uploadingFilesList,
  };
}

export default connect(mapStateToProps)(UploadFile);
