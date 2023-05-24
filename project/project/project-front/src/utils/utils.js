import { dispatcher } from "../redux/redux";
import { store } from "../redux/redux";
import Peer from "peerjs";

async function connection(socket, timeout = 10000) {
  const isOpened = () => socket.readyState === WebSocket.OPEN;

  if (socket.readyState !== WebSocket.CONNECTING) {
    return isOpened();
  } else {
    const intrasleep = 100;
    const ttl = timeout / intrasleep; // time to loop
    let loop = 0;
    while (socket.readyState === WebSocket.CONNECTING && loop < ttl) {
      await new Promise((resolve) => setTimeout(resolve, intrasleep));
      loop++;
    }
    return isOpened();
  }
}
function getRandomInt(max = 999) {
  return Math.round(Math.random() * max) + 1;
}
async function isTokenValid(srvMessage, timeout = 10000) {
  const isOpened = () => srvMessage[0] === 2;

  if (srvMessage[0] !== 1 && srvMessage[0] !== 0) {
    return isOpened();
  } else {
    const intrasleep = 100;
    const ttl = timeout / intrasleep; // time to loop
    let loop = 0;
    while (srvMessage[0] === 0 && loop < ttl) {
      await new Promise((resolve) => setTimeout(resolve, intrasleep));
      loop++;
    }
    return isOpened();
  }
}
async function getWsResponse(websocket, eventName, timeout = 10000) {
  let response = [null];
  const isOpened = () => response[0];
  websocket.addEventListener("message", (event) => {
    let data = JSON.parse(event.data);
    if (data.event === eventName) {
      response[0] = data.payload;
    }
  });
  if (response[0] !== null) {
    return isOpened();
  } else {
    const intrasleep = 100;
    const ttl = timeout / intrasleep; // time to loop
    let loop = 0;
    while (response[0] === null && loop < ttl) {
      await new Promise((resolve) => setTimeout(resolve, intrasleep));
      loop++;
    }
    return isOpened();
  }
}
async function getServiceWorker(serviceWorkerArray, timeout = 10000) {
  const isReady = () => serviceWorkerArray[0];
  if (serviceWorkerArray[0] !== null) {
    return isReady();
  } else {
    const intrasleep = 100;
    const ttl = timeout / intrasleep; // time to loop
    let loop = 0;
    while (serviceWorkerArray[0] === null && loop < ttl) {
      await new Promise((resolve) => setTimeout(resolve, intrasleep));
      loop++;
    }
    return isReady();
  }
}
async function getObjectFromProps(propField, propFieldParams, timeout = 20000) {
  let storeState;
  if (propFieldParams !== null) {
    storeState = store.getState()[propField].slice(0);
    if (storeState !== null && storeState !== undefined) {
      let targetField = storeState.find((x) => x[propFieldParams[0]] === propFieldParams[1]);
      if (targetField === null || targetField === undefined) {
        storeState = null;
      }
    }
  } else {
    storeState = store.getState()[propField];
  }

  const isReady = () => storeState;
  if (storeState !== null && storeState !== undefined) {
    return isReady();
  } else {
    const intrasleep = 50;
    const ttl = timeout / intrasleep; // time to loop
    let loop = 0;
    while ((storeState === null || storeState === undefined) && loop < ttl) {
      await new Promise((resolve) => setTimeout(resolve, intrasleep));
      if (propFieldParams !== null) {
        storeState = store.getState()[propField].slice(0);
        if (storeState !== null && storeState !== undefined) {
          let targetField = storeState.find((x) => x[propFieldParams[0]] === propFieldParams[1]);
          if (targetField === null || targetField === undefined) {
            storeState = null;
          }
        }
      } else {
        storeState = store.getState()[propField];
      }
      loop++;
    }
    return isReady();
  }
}
// setTimeout(() => {
//     getObjectFromProps("notificationsList", ["title", "1Incoming call"]);
//     getObjectFromProps("notificationsList", null);
// }, 7000);

function savePagePathToLocalStorage(pathName) {
  window.history.prevPage = pathName;
}
function getFileNameAndExtention(fileNameWithExtention) {
  let fileExtention = fileNameWithExtention.slice(((fileNameWithExtention.lastIndexOf(".") - 1) >>> 0) + 2);
  let fileName;
  if (fileExtention === "") {
    fileName = fileNameWithExtention;
  } else {
    fileName = fileNameWithExtention.slice(0, fileNameWithExtention.length - fileExtention.length - 1);
  }
  return { fileName, fileExtention };
}
async function mergeUploadedChunks(fileNameWithExtention, fileHash, token, websocket, isListFilesNecessary) {
  let { fileName, fileExtention } = getFileNameAndExtention(fileNameWithExtention);
  let requestOptions = {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ fileName: fileName, fileHash: fileHash, fileExtention: fileExtention, token: token }),
  };
  //TODO:change the string adress to the the global var from the config.json or smth like that.
  let response = await fetch("https://localhost:4000/api/upload/merge", requestOptions);
  let data = await response.json();
  //2 possible cases of normal merging response: "file_chunks_merged", "file_exist"
  if (response.status === 200) {
    if (data.response === "file_chunks_merged") {
      //If user is on the files page, initiate the files list updating.
      if (isListFilesNecessary) {
        websocket.send(JSON.stringify({ event: "listFiles" }));
      }
      // dispatcher("setEntropy", { action: [], type: "" });
      console.log("Merged!");
    }
    // else if (data.response === "file_exist") {
    //     console.log("alreadyExists!");
    // }
    return data.response;
  } else {
    console.log("Error!");
    return "Error merging the file chunks!";
  }
}
const serviceWorkerListener = (serviceWorkers, token, websocket) => {
  let filesIds = [];
  console.log("state changed");
  for (let i = 0; i < serviceWorkers.length; ++i) {
    if (serviceWorkers[i][1].onmessage === null) {
      serviceWorkers[i][1].onmessage = async (message) => {
        let workerInstance = serviceWorkers[i][1];
        //This condition is required for not triggering the file upload notification change because of the workerize-loader service messages.
        if (message.data.method !== "ready" && message.data.type !== "RPC") {
          //This is required for the file upload notification change.
          let storeState = store.getState();
          let uploadingFilesList = [...storeState.uploadingFilesList];

          //let notificationId = uploadingFilesList.find((x) => x[0] === message.data.response.fullName)[1];
          //This is required in case when dispatch in UploadFile.jsx was called after this event fired.

          let notificationId = uploadingFilesList.find((x) => x[0] === message.data.response.fullName)[1];
          //This is required in case when dispatch in UploadFile.jsx was called after this event fired.
          let notificationsList = [...storeState.notificationsList];
          //let fileUploadNotification = notificationsList.find((x) => x.fileName === message.data.response.fullName);
          let notification = notificationsList.find((x) => x.id === notificationId);
          //TODO: Proceed the possible exception with nullable notification.

          //TODO: Fix the second undefined param while hashing is in process.
          //TODO: Fix the changing old notification if the it one wasn't closed and the new one exists.
          // let fileResponse = filesIds.find((x) => x[0] === message.data.response.fullName);
          // if (fileResponse === null || fileResponse === undefined) {
          //     filesIds.push([message.data.response.fullName, message.data.response.hash, fileUploadNotification.id]);
          // }

          if (message.data.type === "hash") {
            if (message.data.isHashed === true) {
              //This is required for the file upload notification change.
              notification.description = `Hashing done successfully`;
              //notification.backgroundColor = "#FF8C00";
              console.log("New Message: ", "Hashed");
            } else {
              //This is required for the file upload notification change.
              notification.description = `Hashing ${message.data.response.progress}%`;
              console.log("New Message: ", message.data.response.progress);
            }
          } else if (message.data.type === "upload") {
            if (message.data.isUploaded === true) {
              if (message.data.response.upload === "alreadyExists") {
                console.log(message.data.response);
                //This is required for the file upload notification change.
                notification.description = `Uploading error: file already exists`;
                notification.backgroundColor = "#ff0000";
              } else if (message.data.response.upload === "succesfull") {
                let location = window.location.pathname;
                let isListFilesNecessary = false;
                //TODO:change the string adress to the the global var from the config.json or smth like that.
                if (location === "/files") {
                  isListFilesNecessary = true;
                }
                let mergingResult = await mergeUploadedChunks(message.data.response.fullName, message.data.response.hash, token, websocket, isListFilesNecessary);

                if (mergingResult === "file_chunks_merged") {
                  //This is required for the file upload notification change.
                  notification.description = `Uploading done successfully`;
                  notification.backgroundColor = "#5cb85c";
                } else if (mergingResult === "file_exist") {
                  //This is required for the file upload notification change.
                  notification.description = `Uploading error: file already exists`;
                  notification.backgroundColor = "#ff0000";
                } else if (mergingResult === "Error merging the file chunks!") {
                  //This is required for the file upload notification change.
                  notification.description = `Uploading error: unable to merge the file chunks`;
                  notification.backgroundColor = "#ff0000";
                }

                console.log(message.data.response);
              } else if (message.data.response.upload === "unsuccesfull") {
                //This is required for the file upload notification change.
                notification.description = `Uploading error: unsuccessfull`;
                notification.backgroundColor = "#ff0000";
                console.log(message.data.response);
              } else if (message.data.response.upload === "incorrectToken") {
                //This is required for the file upload notification change.
                notification.description = `Uploading error: incorrect token`;
                notification.backgroundColor = "#ff0000";
                console.log(message.data.response);
              }
              uploadingFilesList = uploadingFilesList.filter((x) => x[0] !== message.data.response.fullName);
              workerInstance.terminate();
              serviceWorkers = serviceWorkers.filter((x) => x[1] !== workerInstance);
              dispatcher("setServiceWorker", { action: serviceWorkers, type: "" });
            } else {
              //This is required for the file upload notification change.
              notification.description = `Uploading ${message.data.response.progress}%`;
              console.log(message.data.response.fullName, message.data.response.progress);
            }
          } else if (message.data.type === "error") {
            notification.description = "Error occured while uploading the file.";
            notification.backgroundColor = "#ff0000";
            uploadingFilesList = uploadingFilesList.filter((x) => x[0] !== message.data.response.fullName);
            workerInstance.terminate();
            serviceWorkers = serviceWorkers.filter((x) => x[1] !== workerInstance);
            dispatcher("setServiceWorker", { action: serviceWorkers, type: "" });
          }
          //This is required for the file upload notification change.
          dispatcher("setNotificationsList", { action: notificationsList, type: "" });
          dispatcher("setUploadingFilesList", { action: uploadingFilesList, type: "" });
        }
      };
    }
  }
};

let utils = {};
utils.connection = connection;
utils.getRandomInt = getRandomInt;
utils.isTokenValid = isTokenValid;
utils.getWsResponse = getWsResponse;
utils.getServiceWorker = getServiceWorker;
utils.getObjectFromProps = getObjectFromProps;
utils.savePagePathToLocalStorage = savePagePathToLocalStorage;
utils.getFileNameAndExtention = getFileNameAndExtention;
utils.mergeUploadedChunks = mergeUploadedChunks;
utils.serviceWorkerListener = serviceWorkerListener;

export default utils;
//store.subscribe(serviceWorkerListener);
