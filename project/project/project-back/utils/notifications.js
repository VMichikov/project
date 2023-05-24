const { db } = require("../models/user.model");
const utils = require("./utils");
exports.addFriendsNotification = async (userId, friendId) => {
  try {
    let dstConnection = wsServer.connections.find((x) => x.userId == friendId);
    await db.Notifications.create({
      source_id: userId,
      destination_id: friendId,
      type: "add_friend",
      count: 0, // для добавления в друзья count  = 0, т.к. при добавлении сообщений count!=0 (т.к. count предназначен для подсчета сообщений)
    });
    if (dstConnection != null) {
      utils.sendMessage(dstConnection, "notification", "add_friend", JSON.stringify({ sourceId: userId }));
      return;
    }
  } catch (e) {
    throw new Error(e.message);
  }
};
//The half of this code need to be deleted because if user is online, he receives msg text and that is enough for considering it on client side as a msg notification
exports.sendDirectMessageNotification = async (srcConnection, dstConnection, dstUserId) => {
  try {
    let dialogNotification = await db.Notifications.findOne({
      where: {
        source_id: srcConnection.userId,
        destination_id: dstUserId,
        type: "direct_message",
      },
    });
    // this could be removed becuse the client side parsing
    if (dstConnection != null) {
      if (dialogNotification != null) {
        let count = parseInt(dialogNotification.count);
        count += 1;
        dialogNotification.count = count;
        await dialogNotification.save();
      } else {
        dialogNotification = db.Notifications.build({
          source_id: srcConnection.userId,
          destination_id: dstConnection.userId,
          type: "direct_message",
          count: 1,
        });
        await dialogNotification.save();
      }
      utils.sendMessage(
        dstConnection,
        "notification",
        "direct_message",
        JSON.stringify({
          sourceId: srcConnection.userId,
          count: dialogNotification.count,
        })
      );
    } else {
      if (dialogNotification != null) {
        let count = parseInt(dialogNotification.count);
        count += 1;
        dialogNotification.count = count;
        await dialogNotification.save();
      } else {
        dialogNotification = db.Notifications.build({
          source_id: srcConnection.userId,
          destination_id: dstUserId,
          type: "direct_message",
          count: 1,
        });
        await dialogNotification.save();
      }
    }
  } catch (e) {
    throw new Error(e.message);
  }
  return;
};
