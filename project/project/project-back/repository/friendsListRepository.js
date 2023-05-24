const sequelize = require("../models/user.model").sequelize;
const QueryTypes = require("../models/user.model").QueryTypes;
let db = require("./../models/user.model").db;
class friendsListRepository {
  constructor() {}
  listFriends = async (userId) => {
    let listFriends = await sequelize.query(
      `(SELECT friend_id FROM friends_list where (user_id = ${userId} AND is_approved = true)) UNION (SELECT user_id as user_id FROM friends_list where (friend_id = ${userId} AND is_approved = true)) 
      order by friend_id;`,
      {
        type: QueryTypes.SELECT,
      }
    );
    let onlyId = listFriends.map((item) => {
      return item.friend_id;
    });
    let users = db.Users.findAll({ where: { user_id: onlyId } });
    return users;
  };
  friendRequests = async (userId) => {
    let friendRequests = await sequelize.query(
      `(SELECT friend_id FROM friends_list where (user_id = ${userId} AND is_approved = false))
      order by friend_id;`,
      {
        type: QueryTypes.SELECT,
      }
    );
    let onlyId = friendRequests.map((item) => {
      return item.friend_id;
    });
    let users = db.Users.findAll({ where: { user_id: onlyId } });
    return users;
  };
  friendResponses = async (userId) => {
    let friendResponces = await sequelize.query(
      `(SELECT user_id FROM friends_list where (friend_id = ${userId} AND is_approved = false)) 
      order by user_id;`,
      {
        type: QueryTypes.SELECT,
      }
    );
    let onlyId = friendResponces.map((item) => {
      return item.user_id;
    });
    let users = db.Users.findAll({ where: { user_id: onlyId } });
    return users;
  };
  destroyFriendConnection = async (userId, friendId) => {
    await sequelize.query(
      `delete from friends_list where (user_id in (SELECT user_id FROM friends_list where (user_id = ${userId} and friend_id =${friendId}) union SELECT user_id FROM friends_list where (user_id = ${friendId} and friend_id =${userId})) and friend_id in (SELECT friend_id FROM friends_list where (user_id = ${userId} and friend_id =${friendId}) union SELECT friend_id FROM friends_list where (user_id = ${friendId} and friend_id = ${userId})))`,
      {
        type: QueryTypes.DELETE,
      }
    );
  };
}
module.exports = friendsListRepository;
