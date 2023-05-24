const { db } = require("../../models/user.model");
const utils = require("../../utils/utils");
const config = require("./../../config");
const { repository } = require("../../repository/repository");
const notifications = require("../../utils/notifications");
// max message length param.
if (!config["messages"]) {
  console.error("FATAL ERROR: Max message length is not defined.");
  process.exit(1);
}
//FIXME: fixed only else condition rn
exports.sendDirectMessageToUser = async (srcConnection, data) => {
  try {
    if (data.dstUserId == "" || data.dstUserId == null || isNaN(data.dstUserId)) {
      utils.sendMessage(srcConnection, "directMessageArgumentsError", null, "No dstUserId", srcConnection.userId); // Тут без data.randomId
      return;
    } else if (data.message == "" || data.message == null) {
      utils.sendMessage(srcConnection, "directMessageArgumentsError", null, "No message", srcConnection.userId); // Тут без data.randomId
      return;
    } else if (data.randomId == "" || data.randomId == null || isNaN(data.randomId)) {
      utils.sendMessage(srcConnection, "directMessageArgumentsError", null, "No randomId", srcConnection.userId); // Тут без data.randomId
      return;
    } else if (data.message.length > config["messages"].maxLength) {
      utils.sendMessage(srcConnection, "directMessageLengthError", null, "Message should not be longer than 300 symbols!", srcConnection.userId, data.randomId);
      return;
    }
    if (srcConnection.userId == data.dstUserId) {
      utils.sendMessage(srcConnection, "directMessageError", null, "You can't send messages to yourself!", data.dstUserId, data.randomId);
    } else {
      let dstConnections = wsServer.connections.filter((x) => x.userId == data.dstUserId);
      let srcConnections = wsServer.connections.filter((x) => x.userId == srcConnection.userId);
      if (dstConnections.length != 0) {
        let message = await db.Messages.create({ text: data.message, date: Date(), source_id: srcConnection.userId, destination_id: data.dstUserId, is_pinned: false, is_pending: 1 });
        dstConnections.forEach((element) => {
          utils.sendMessage(element, "directMessage", null, message, srcConnection.userId); // Тут без data.randomId, подумать
          notifications.sendDirectMessageNotification(srcConnection, element, data.dstUserId);
        });
        srcConnections.forEach((element) => {
          utils.sendMessage(element, "directMessageResponse", "received", message, data.dstUserId, data.randomId);
        });

        //dstConnection.sendUTF(msgText);
      } else {
        let message = await db.Messages.create({ text: data.message, date: Date(), source_id: srcConnection.userId, destination_id: data.dstUserId, is_pinned: false, is_pending: 0 });
        //let result = await db.Users.update({ notification: true }, { where: { user_id: data.dstUserId } });
        //let srcUser = await db.Users.findOne({ where: { user_id: srcConnection.userId } });
        // await db.Notifications.create({ user_id: data.dstUserId, notification: `New direct message from ${srcUser.username}`, type: "direct_message" });
        //console.log(result);
        srcConnections.forEach((element) => {
          utils.sendMessage(element, "directMessageResponse", "pending", message, data.dstUserId, data.randomId);
        });
        notifications.sendDirectMessageNotification(element, null, data.dstUserId);
      }
    }
  } catch (e) {
    console.log(e);
    throw new Error(e.message);
  }
};
//(select * from messages where (source_id) in ((SELECT distinct destination_id as user_id FROM public.messages where source_id = 123 order by destination_id) UNION (SELECT distinct source_id FROM public.messages where destination_id = 123 order by source_id)) union (select * from messages where (destination_id) in ((SELECT distinct destination_id as user_id FROM public.messages where source_id = 123 order by destination_id) UNION (SELECT distinct source_id FROM public.messages where destination_id = 123 order by source_id))) order by id);
//List dialogs for current user (in connection.userId)
exports.listDialogs = async (connection) => {
  let dialogsList = await repository.messages.getDialogsList(connection.userId);
  utils.sendMessage(connection, "listDialogs", null, JSON.stringify(dialogsList));
};
//List current user (in connection.userId) messages for specified array of dialogs
//TODO: listDialogMessages contain an error, it should return all provided dialogs messages, not a single one
exports.listDialogsMessages = async (connection, data) => {
  if (data.dialogsList == "" || data.dialogsList == null || data.dialogsList.length == null || data.dialogsList.length == 0) {
    utils.sendMessage(connection, "listDialogsMessagesArgumentsError", null, "Incorrect dialogsList!");
    return;
  }
  for (let i = 0; i < data.dialogsList.length; ++i) {
    if (isNaN(data.dialogsList[i])) {
      utils.sendMessage(connection, "listDialogsMessagesArgumentsError", null, "Array should only contain numbers!");
      return;
    } else if (data.dialogsList[i] == connection.userId) {
      utils.sendMessage(connection, "listDialogsMessagesArgumentsError", null, "Array should not contain itself user_id!");
      return;
    }
  }
  let messagesList = await repository.messages.getDialogsMessages(data.dialogsList, connection.userId);
  utils.sendMessage(connection, "listDialogMessages", null, JSON.stringify(messagesList));
};
exports.viewDialogMessagesNotifications = async (connection, data) => {
  try {
    if (data.dialogId == "" || data.dialogId == null || isNaN(data.dialogId) || data.dialogId.length == null) {
      throw new Error("DialogId is invalid!");
    } else {
      let dialogNotification = await db.Notifications.findOne({ where: { source_id: data.dialogId, destination_id: connection.userId, type: "direct_message" } });
      if (dialogNotification == null) {
        throw new Error("Notification does not exist!");
      } else {
        await dialogNotification.destroy();
        utils.sendMessage(connection, "viewDialog", null, "Notification have been deleted!");

        await db.Messages.update({ is_pending: 2 }, { where: { source_id: data.dialogId, destination_id: connection.userId, is_pending: true } });
        let dstConnection = wsServer.connections.find((x) => x.userId == data.dialogId);
        if (dstConnection != null) {
          utils.sendMessage(dstConnection, "dialogViewed", null, null, connection.userId);
        }
      }
    }
  } catch (e) {
    throw new Error(e.message);
  }
};
