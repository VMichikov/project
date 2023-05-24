import { createStore } from "redux";

const reducer = (
  state = {
    token: null,
    isAuth: null,
    websocket: null,
    websocketResponse: null,
    userId: null,
    error: null,
    sourceIdAndPeerIdForACall: [],
    filesToDownload: null,
    notificationsList: [],
    notificationsCounter: 1,
    serviceWorker: [],
    uploadingFilesList: [],
    //WebRTC section
    myPeer: null,
    stream: null,
    callId: null,
    streamBlocks: [],
    videoBlocks: [],
    ////////
    leftBarList: null,
  },
  action
) => {
  switch (action.type) {
    //For reducing the amount of rerendering of the App.jsx
    case "setCallId":
      // console.log(state.loading);
      return Object.assign({}, state, {
        callId: action.settings.action,
      });
    case "setLeftBarList":
      // console.log(state.loading);
      return Object.assign({}, state, {
        leftBarList: action.settings.action,
      });
    case "setVideoBlocks":
      // console.log(state.loading);

      return Object.assign({}, state, {
        videoBlocks: action.settings.action,
      });
    case "setStreamBlocks":
      // console.log(state.loading);

      return Object.assign({}, state, {
        streamBlocks: action.settings.action,
      });
    case "setScreenStream":
      // console.log(state.loading);

      return Object.assign({}, state, {
        screenStream: action.settings.action,
      });
    case "setWebsocketAndAuth":
      // console.log(state.loading);
      return Object.assign({}, state, {
        websocket: action.settings.action.websocket,
        isAuth: action.settings.action.auth,
      });
    case "setWebRTCParams":
      // console.log(state.loading);
      return Object.assign({}, state, {
        myPeer: action.settings.action.myPeer,
        stream: action.settings.action.stream,
      });
    case "setAuthorized":
      return Object.assign({}, state, {
        isAuth: action.settings.action,
      });
    case "setSourceIdAndPeerIdForACall":
      return Object.assign({}, state, {
        sourceIdAndPeerIdForACall: action.settings.action,
      });
    case "setUploadingFilesList":
      return Object.assign({}, state, {
        uploadingFilesList: action.settings.action,
      });
    case "authorized":
      //setTimeout(() => {
      //transition();
      //}, 10);
      return Object.assign({}, state, {
        //path: "/profile",
        //flagChangePage: false,
        //nextPagePath: "",
        isAuth: true,
      });
    // break;
    case "setNotificationsCounter":
      return Object.assign({}, state, {
        notificationsCounter: action.settings.action,
      });

    case "isNotAuthorized":
      //setTimeout(() => {
      //transition();
      //}, 10);
      return Object.assign({}, state, {
        //path: "/profile",
        //flagChangePage: false,
        //nextPagePath: "",
        isAuth: false,
      });
    // break;
    case "setToken":
      // console.log(state.loading);
      return Object.assign({}, state, {
        token: action.settings.action,
      });
    case "setNotificationsList":
      // console.log(state.loading);
      return Object.assign({}, state, {
        notificationsList: action.settings.action,
      });
    case "setServiceWorker":
      // console.log(state.loading);
      return Object.assign({}, state, {
        serviceWorker: action.settings.action,
      });
    // break;
    case "setWebsocket":
      // console.log(state.loading);
      return Object.assign({}, state, {
        websocket: action.settings.action,
      });
    // break;
    case "setWebsocketResponse":
      // console.log(state.loading);
      return Object.assign({}, state, {
        websocketResponse: action.settings.action,
      });
    case "setUserId":
      // console.log(state.loading);
      return Object.assign({}, state, {
        userId: action.settings.action,
      });
    case "setError":
      // console.log(state.loading);
      return Object.assign({}, state, {
        error: action.settings.action,
      });
    case "setErrorAndAuth":
      // console.log(state.loading);
      return Object.assign({}, state, {
        error: action.settings.action,
        isAuth: false,
      });
    case "setFilesToDownload":
      // console.log(state.loading);
      return Object.assign({}, state, {
        filesToDownload: action.settings.action,
      });
    default:
      return state;
  }
};
const store = createStore(reducer);
function dispatcher(action, settings) {
  store.dispatch({ type: action, settings });
}

export { store, dispatcher };
