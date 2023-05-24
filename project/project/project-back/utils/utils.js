const { db } = require("../models/user.model");
const { repository } = require("../repository/repository");
exports.generateToken = () => {
  var token = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (i = 0; i < 6; i++) {
    token += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return token;
};
// exports.originIsAllowed = (origin) => {
//   // put logic here to detect whether the specified origin is allowed.
//   return true;
// };
exports.checkupForFriendsController = async (connection, payload) => {
  let data = JSON.parse(payload);
  if (data.receiverId != null) {
    if (connection.userId == data.receiverId) {
      throw new Error("Один и тот же пользователь");
    }
    var user2 = await db.Users.findOne({ where: { user_id: data.receiverId } });
    if (user2 == null) {
      throw new Error("Пользователь не существует");
    }
    let userFriends = await repository.friendsList.listFriends(connection.userId);
    let receiver = userFriends.find((item) => item.user_id == data.receiverId);
    return receiver;
  } else {
    if (connection.userId == data.friendId) {
      throw new Error("Один и тот же пользователь");
    }
    var user2 = await db.Users.findOne({ where: { user_id: data.friendId } });
    if (user2 == null) {
      throw new Error("Пользователь не существует");
    }
    let userFriends = await repository.friendsList.listFriends(connection.userId);
    let friend = userFriends.find((item) => item.user_id == data.friendId);
    return friend;
  }
};
exports.sendMessage = (connection, event, type, payload, userId, randomId) => {
  if (event != null && type == null && payload != null && userId != null && randomId != null) {
    connection.sendUTF(
      JSON.stringify({
        event: event,
        payload: payload,
        userId: userId,
        randomId: randomId,
      })
    );
  } else if (event != null && type == null && payload != null && userId != null && randomId == null) {
    connection.sendUTF(JSON.stringify({ event: event, payload: payload, userId: userId }));
  } else if (event != null && type == null && payload == null && userId != null && randomId == null) {
    connection.sendUTF(JSON.stringify({ event: event, userId: userId }));
  } else if (event != null && type == null && payload == null && userId != null && randomId != null) {
    connection.sendUTF(JSON.stringify({ event: event, userId: userId, randomId: randomId }));
  } else if (event != null && type == null && payload != null && userId == null && randomId == null) {
    connection.sendUTF(JSON.stringify({ event: event, payload: payload }));
  } else if (event != null && type != null && payload != null && userId == null && randomId == null) {
    connection.sendUTF(JSON.stringify({ event: event, type: type, payload: payload }));
  } else if (event != null && type == null && payload == null && userId != null && randomId == null) {
    connection.sendUTF(JSON.stringify({ event: event, userId: userId }));
  } else if (event != null && type != null && payload != null && userId != null && randomId != null) {
    connection.sendUTF(
      JSON.stringify({
        event: event,
        type: type,
        payload: payload,
        userId: userId,
        randomId: randomId,
      })
    );
  }
};

//let dialogNotification = db.Notifications.build({ source_id: 123, destination_id: 123, type: "direct_message", count: 1 });
//console.log(dialogNotification);
//dialogNotification.save();
