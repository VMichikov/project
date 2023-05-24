const messagesController = require("../controllers/ws/messagesController");
const friendsController = require("../controllers/ws/friendsController");
const callsController = require("../controllers/ws/callsController");
const uploadController = require("../controllers/ws/uploadController");
const Utils = require("../utils/utils");
exports.onMessage = async (connection, peerConnections) => {
  callsController.setPeerConnections(peerConnections);
  connection.on("message", async function (message) {
    let data;
    try {
      try {
        data = JSON.parse(message.utf8Data);
      } catch (e) {
        throw new Error("data format is invalid!");
      }

      if (data.event == "directMessage") {
        //Для проверки directMessage
        //websocket.send( JSON.stringify({event: "directMessage", dstUserId: 345, message: 123, randomId: 3}))
        await messagesController.sendDirectMessageToUser(connection, data); //Допилить таблицу notifications, добавив туда message_id
      } else if (data.event == "listFriends") {
        await friendsController.listfriends(connection);
        //websocket.send( JSON.stringify({event: "listFriends"}))
      } else if (data.event == "friendRequests") {
        await friendsController.friendRequests(connection);
        //websocket.send( JSON.stringify({event: "friendRequests"}))
      } else if (data.event == "friendResponses") {
        await friendsController.friendResponses(connection);
        //websocket.send( JSON.stringify({event: "friendResponses"}))
      } else if (data.event == "addFriend") {
        //websocket.send( JSON.stringify({event: "addFriend",friendId: 77}))
        await friendsController.addFriends(connection, data);
      } else if (data.event == "deleteFriend") {
        //websocket.send( JSON.stringify({event: "deleteFriend", friendId: 789}))
        await friendsController.deleteFriendConnection(connection, data);
      } else if (data.event == "approveFriend") {
        // websocket.send( JSON.stringify({event: "approveFriend", friendId: 345}))
        await friendsController.approveFriendConnection(data, connection);
      } else if (data.event == "webRTCCall") {
        //websocket.send( JSON.stringify({event: "webRTCCall", friendId: 345}))
        await callsController.webRTCCall(connection, data);
      } else if (data.event == "IncomingCallReject") {
        //websocket.send( JSON.stringify({event: "webRTCCall", friendId: 345}))
        await callsController.IncomingCallReject(connection, data);
      } else if (data.event == "IncomingCallAccept") {
        //websocket.send( JSON.stringify({event: "webRTCCall", friendId: 345}))
        await callsController.IncomingCallAccept(data);
      } else if (data.event == "disableShareScreen") {
        //websocket.send( JSON.stringify({event: "webRTCCall", friendId: 345}))
        await callsController.disableShareScreen(data);
      } else if (data.event == "finishTheCall") {
        //websocket.send( JSON.stringify({event: "webRTCCall", friendId: 345}))
        await callsController.finishTheCall(data);
      } else if (data.event == "restoreConnection") {
        //websocket.send( JSON.stringify({event: "webRTCCall", friendId: 345}))
        await callsController.restoreConnection(data);
      } else if (data.event == "sendIdForRestore") {
        //websocket.send( JSON.stringify({event: "webRTCCall", friendId: 345}))
        await callsController.sendIdForRestore(data);
      }
      //websocket.send( JSON.stringify({event: "listDialogs"}))
      else if (data.event == "listDialogs") {
        await messagesController.listDialogs(connection);
      }
      //websocket.send( JSON.stringify({event: "listDialogsMessages", dialogsList: [123, 345]}))
      else if (data.event == "listDialogsMessages") {
        await messagesController.listDialogsMessages(connection, data);
      }
      //websocket.send( JSON.stringify({event: "viewDialogMessagesNotifications", dialogId: "123"}))
      else if (data.event == "viewDialogMessagesNotifications") {
        await messagesController.viewDialogMessagesNotifications(connection, data);
      } else if (data.event == "listFiles") {
        await uploadController.listUserFiles(connection);
      }
    } catch (e) {
      Utils.sendMessage(connection, "error", null, e.message);
    }
  });
};
