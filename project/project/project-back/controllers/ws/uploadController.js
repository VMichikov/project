const { connection } = require("websocket");
const { db } = require("../../models/user.model");
const utils = require("../../utils/utils");

exports.listUserFiles = async (connection) => {
  let files = await db.Files.findAll({
    where: { user_id: connection.userId },
  });
  files = files.map((item) => {
    return { id: item.id, hash: item.hash, name: item.name, extention: item.extention };
  });
  utils.sendMessage(connection, "listFiles", null, JSON.stringify(files));
};
