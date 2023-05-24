const { db } = require("../../models/user.model");
const notifications = require("../../utils/notifications");
const { repository } = require("../../repository/repository");
const utils = require("../../utils/utils");

//TODO:  Передаваемая в checkup data переписана под переменную, ранее там был массив
exports.listfriends = async (connection) => {
  let friends = await repository.friendsList.listFriends(connection.userId);
  let friendsInfo = friends.map((item) => {
    return [item.username, item.user_id, item.avatar_id, item.status, item.status_message];
  });
  utils.sendMessage(connection, "listFriends", null, JSON.stringify(friendsInfo));
  return;
};

exports.friendRequests = async (connection) => {
  let friends = await repository.friendsList.friendRequests(connection.userId);
  let friendsInfo = friends.map((item) => {
    return [item.username, item.user_id, item.avatar_id, item.status, item.status_message];
  });
  utils.sendMessage(connection, "friendRequests", null, JSON.stringify(friendsInfo));
  return;
};

exports.friendResponses = async (connection) => {
  let friends = await repository.friendsList.friendResponses(connection.userId);
  let friendsInfo = friends.map((item) => {
    return [item.username, item.user_id, item.avatar_id, item.status, item.status_message];
  });
  utils.sendMessage(connection, "friendResponses", null, JSON.stringify(friendsInfo));
  return;
};

exports.addFriends = async (connection, data) => {
  //TODO: data or data.payload?? check it up
  let friend = await utils.checkupForFriendsController(connection, data);
  if (friend != null) {
    throw new Error("Пользователь уже добавлен");
  }
  await db.FriendsList.create({
    user_id: connection.userId,
    friend_id: data.friendId,
    is_approved: false,
  });
  await notifications.addFriendsNotification(connection.userId, data.friendId);
  return;
};

exports.deleteFriendConnection = async (connection, data) => {
  //возможно наличие true или false не имеет значения
  let friend = await utils.checkupForFriendsController(connection, data.payload);
  if (friend == null) {
    throw new Error("Такой связи нет");
  }
  await repository.friendsList.destroyFriendConnection(connection.userId, friend.user_id);
  connection.sendUTF(JSON.stringify({ event: "deleteFriendResponse", payload: JSON.stringify({ friendId: friend.user_id }) }));
};

exports.approveFriendConnection = async (data, connection) => {
  let friend = await utils.checkupForFriendsController(connection, data.payload);
  if (friend == null) {
    throw new Error("Такой связи нет");
  }
  let checkflag = await db.FriendsList.findOne({
    where: { user_id: friend.user_id, friend_id: connection.userId },
  });
  if (checkflag == null) {
    throw new Error("Добавляющий не может подтвержать связь");
  }
  if (checkflag.is_approved == true) {
    throw new Error("Связь уже подтверждена");
  }
  await db.FriendsList.update({ is_approved: true }, { where: { user_id: friend.user_id, friend_id: connection.userId } });
  connection.sendUTF(JSON.stringify({ event: "approveFriendResponse", payload: JSON.stringify({ friendId: friend.user_id }) }));
};
