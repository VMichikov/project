const friendsController = require("../controllers/ws/friendsController");
const { Users, FriendsList, f } = require("../models/user.model");

exports.test = async () => {
  //  генерация одинаковых пользователей
  //   for (i = 11; i <= 100; ++i) {
  //     await Users.create({
  //       user_id: i,
  //       username: "Vlad",
  //       password: "222",
  //       email: "vladv",
  //       phone: "85003005030",
  //       is_premium: true,
  //       is_deleted: false,
  //       last_active: "2018-09-03",
  //       avatar_id: 243,
  //       status: 1,
  //       status_message: "abc",
  //       token: "6732",
  //       notification: false,
  //     });
  //   }
  // создание одной записи на одну связь между пользователями с проверкой на существование обратной связи
  //   var check;
  //   for (i = 1; i <= 100; ++i) {
  //     for (j = 1; j <= 100; ++j) {
  //       if (i != j) {
  //         check = await FriendsList.findAll({
  //           where: { user_id: j, friend_id: i },
  //         });
  //         if (check.length == 0) {
  //           await FriendsList.create({
  //             user_id: i,
  //             friend_id: j,
  //           });
  //         }
  //       }
  //     }
  //   }
  // замеряем среднее время вызова списка друзей из 1000 попыток
  // var sum = 0;
  // for (i = 0; i < 1000; ++i) {
  //   var s_time = performance.now();
  //   //let user = await friendsController.listfriends(100);
  //   // let friends = user.map((item) => {
  //   //   return item.friend_id;
  //   // });
  //   let friends = await f("сюда вписать id пользователя");
  //   var dur = performance.now() - s_time;
  //   sum += dur;
  // }
  // var mid = sum / 1000;
  // console.log(mid);
};
