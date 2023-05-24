const { db } = require("../models/user.model");
const notificationController = require("../controllers/ws/notificationsController");
const addFriendController = require("../controllers/ws/notificationsController");
exports.onNotification = async (connection) => {
  //let user = await db.Users.findOne({ where: { user_id: connection.userId } }); // тут пользователь однозначно существует, т к его только что проверили в авторизации.
  let notifications = await db.Notifications.findAll({
    where: { destination_id: connection.userId },
  });
  let directMessageNotifications = notifications.filter((x) => x.type == "direct_message");
  let addFriendNotifications = notifications.filter((x) => x.type == "add_friend");
  if (directMessageNotifications.length != 0) {
    //Handler for one type of the possible notifications
    await notificationController.directMessageHandler(connection, directMessageNotifications);
  }
  // for (let i = 0; i < notifications.length; ++i) {
  //     if (notifications[i].type == "direct_message") {
  //     } else if (notifications[i].type == "add_friend") {
  //         await addFriendController.addFriendHandler(user, connection);
  //     }

  // await db.Notifications.destroy({
  //     where: { notification: notifications[i].notification },
  // }); //Конкретизировать уведомление, т к сообщений от ивана может быть много и нельзя все удалить за раз
  //}
  // user.notification = false;
  //await user.save();
};
