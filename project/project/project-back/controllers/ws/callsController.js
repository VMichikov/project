const { db } = require("../../models/user.model");
const notifications = require("../../utils/notifications");
const { repository } = require("../../repository/repository");
const utils = require("../../utils/utils");
var peerConnections = null;
exports.webRTCCall = async (connection, data) => {
  let receiver = await utils.checkupForFriendsController(connection, data.payload);
  if (receiver == null) {
    throw new Error("Пользователя нет у вас в друзьях");
  }
  //TODO: другие проверки??
  let dstConnection = wsServer.connections.find((x) => x.userId == receiver.user_id);
  let source = await db.Users.findOne({ where: { user_id: connection.userId } });
  if (dstConnection != null) {
    let dataPayload = JSON.parse(data.payload);
    let peerId = dataPayload.peerId;
    dstConnection.sendUTF(JSON.stringify({ event: "incomingCall", payload: JSON.stringify({ receiverId: receiver.user_id, sourceName: source.username, sourceId: source.user_id, peerId: peerId }) }));
  } else {
    throw new Error("Пользователь оффлайн");
  }
};

exports.IncomingCallReject = async (connection, data) => {
  let source = JSON.parse(data.payload);
  let dstConnection = wsServer.connections.find((x) => x.userId == source.sourceId);
  let receiver = await db.Users.findOne({ where: { user_id: connection.userId } });
  if (dstConnection != null) {
    dstConnection.sendUTF(JSON.stringify({ event: "IncomingCallReject", payload: JSON.stringify({ receiverName: receiver.username, receiverId: receiver.user_id }) }));
  } else {
    throw new Error("Пользователь оффлайн");
  }
};

exports.IncomingCallAccept = async (data) => {
  let dataPayload = JSON.parse(data.payload);
  let dstConnection = wsServer.connections.find((x) => x.userId == dataPayload.sourceId);
  if (dstConnection != null) {
    let peerId = dataPayload.peerId;
    peerConnections.push({ user1: dataPayload.sourceId, user1Peer: dataPayload.sourcePeerId, user2: dataPayload.receiverId, user2Peer: peerId });
    dstConnection.sendUTF(JSON.stringify({ event: "SendPeerToSource", payload: JSON.stringify({ peerId: peerId }) }));
  } else {
    throw new Error("Пользователь оффлайн");
  }
};

exports.finishTheCall = async (data) => {
  let callMember = JSON.parse(data.payload);
  let dstConnection = wsServer.connections.find((x) => x.userId == callMember.callMemberId);
  if (dstConnection != null) {
    for (let i = 0; i < peerConnections.length; ++i) {
      if (peerConnections[i].user1 == callMember.callMemberId) {
        peerConnections.splice(i, 1);
      } else if (peerConnections[i].user2 == callMember.callMemberId) {
        peerConnections.splice(i, 1);
      }
    }
    dstConnection.sendUTF(JSON.stringify({ event: "finishTheCall" }));
  } else {
    throw new Error("Пользователь оффлайн");
  }
};

exports.disableShareScreen = async (data) => {
  let callMember = JSON.parse(data.payload);
  let dstConnection = wsServer.connections.find((x) => x.userId == callMember.callMemberId);
  if (dstConnection != null) {
    dstConnection.sendUTF(JSON.stringify({ event: "disableShareScreen" }));
  } else {
    throw new Error("Пользователь оффлайн");
  }
};

exports.setPeerConnections = async (incomingPeerConnections) => {
  peerConnections = incomingPeerConnections;
};
exports.sendIdForRestore = async (data) => {
  let dataPayload = JSON.parse(data.payload);
  let dstConnection = wsServer.connections.find((x) => x.userId == dataPayload.sourceId);
  if (dstConnection != null) {
    peerConnections.push({ user1: dataPayload.sourceId, user1Peer: dataPayload.sourcePeerId, user2: dataPayload.receiverId, user2Peer: dataPayload.receiverPeerId });
    dstConnection.sendUTF(JSON.stringify({ event: "SendPeerToSource", payload: JSON.stringify({ peerId: dataPayload.receiverPeerId }) }));
  } else {
    throw new Error("Пользователь оффлайн");
  }
};

exports.restoreConnection = async (data) => {
  //TODO: is checkup nessesary?
  let dataPayload = JSON.parse(data.payload);
  let dstConnection = wsServer.connections.find((x) => x.userId == dataPayload.receiverId);
  if (dstConnection != null) {
    dstConnection.sendUTF(JSON.stringify({ event: "restoreConnection", payload: JSON.stringify({ receiverId: dataPayload.receiverId, sourcePeerId: dataPayload.sourcePeerId }) }));
  } else {
    throw new Error("Пользователь оффлайн");
  }
};
