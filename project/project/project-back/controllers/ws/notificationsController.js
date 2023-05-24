const { db } = require("../../models/user.model");
const utils = require("../../utils/utils");
exports.directMessageHandler = async (connection, notifications) => {
  //let notifications = await db.Notifications.findAll({ where: { destination_id: connection.userId, type: "direct_message" } });
  let dialogsList = notifications.map((item) => ({
    dialog_id: item.source_id,
    count: item.count,
  }));
  await db.Messages.update({ is_pending: 1 }, { where: { source_id: notifications[0].source_id, destination_id: connection.userId, is_pending: 0 } });
  let dstConnection = wsServer.connections.find((x) => x.userId == notifications[0].source_id);
  if (dstConnection != null) {
    utils.sendMessage(dstConnection, "dialogReceived", null, null, connection.userId);
  }
  connection.sendUTF(
    JSON.stringify({
      event: "notification",
      type: "direct_message",
      payload: dialogsList,
    })
  );
};
//FIXME: возвращает идшники(все сразу) добавивших тебя людей, сравнить с показателем addfriendNotification в onNotification
exports.addFriendHandler = async (user, connection) => {
  let notificationsInfo = await db.Notifications.findAll({
    where: { destination_id: user.user_id, type: "add_friend" },
  });
  let sourcesInfo = notificationsInfo.map((item) => {
    return item.source_id;
  });
  utils.sendMessage(connection, "notification", "add_friend", JSON.stringify({ sourceId: sourcesInfo }));
};
