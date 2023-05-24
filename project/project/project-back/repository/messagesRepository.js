const sequelize = require("../models/user.model").sequelize;
const QueryTypes = require("../models/user.model").QueryTypes;
let db = require("./../models/user.model").db;
class messagesRepository {
  constructor() {}

  getDialogsList = async (userId) => {
    // только id (SELECT distinct destination_id as user_id FROM messages where source_id = ${userId} order by destination_id) UNION (SELECT distinct source_id FROM messages where destination_id = ${userId} order by source_id);

    let dialogsList = await sequelize.query(
      `select user_id, username, email, phone, is_premium, is_deleted, last_active, avatar_id, status, status_message from users where user_id in ((SELECT distinct destination_id as user_id FROM messages where source_id = ${userId} order by destination_id) UNION (SELECT distinct source_id FROM messages where destination_id = ${userId} order by source_id));`,
      { type: QueryTypes.SELECT }
    );
    return dialogsList;
  };
  getMessage = async (messageId) => {
    let message = await db.Messages.findOne({ where: { id: messageId } });
    return message;
  };
  getDialogsMessages = async (dialogsList, userId) => {
    //(select * from messages where (source_id) in ((SELECT distinct destination_id as user_id FROM public.messages where source_id = 123 order by destination_id) UNION (SELECT distinct source_id FROM public.messages where destination_id = 123 order by source_id)) union (select * from messages where (destination_id) in ((SELECT distinct destination_id as user_id FROM public.messages where source_id = 123 order by destination_id) UNION (SELECT distinct source_id FROM public.messages where destination_id = 123 order by source_id))) order by id);
    //
    //(select * from messages where (source_id in (789, 345) and destination_id = 123) union select * from messages where (destination_id in (789, 345) and source_id = 123)) order by id;
    let getAllMessages = await sequelize.query(
      `(select * from messages where (source_id in (${dialogsList}) and destination_id = ${userId}) union select * from messages where (destination_id in (${dialogsList}) and source_id = ${userId})) order by id;`,
      {
        type: QueryTypes.SELECT,
      }
    );
    return getAllMessages;
  };
}
module.exports = messagesRepository;
