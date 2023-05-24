const { Sequelize, Model, DataTypes, QueryTypes } = require("sequelize");
const config = require("./../config");
if (!config["database"]) {
  console.error("FATAL ERROR: database connection data is not defined.");
  process.exit(1);
}
// Option 1: Passing a connection URI
let dataBaseInfo = config["database"];
const sequelize = new Sequelize(`postgres://${dataBaseInfo.user}:${dataBaseInfo.password}@${dataBaseInfo.host}:${dataBaseInfo.port}/${dataBaseInfo.database}`, {
  define: {
    timestamps: false,
  },
  //logging: false
});

let Users = require("./users.js")(sequelize, DataTypes);
let FriendsList = require("./friendsList")(sequelize, DataTypes);
let Messages = require("./messages")(sequelize, DataTypes);
let Notifications = require("./notifications")(sequelize, DataTypes);
let UserOptions = require("./userOptions")(sequelize, DataTypes);
let Files = require("./files")(sequelize, DataTypes);

const db = {};

db.Users = Users;
db.FriendsList = FriendsList;
db.Messages = Messages;
db.Notifications = Notifications;
db.UserOptions = UserOptions;
db.Files = Files;

exports.db = db;
exports.sequelize = sequelize;
exports.DataTypes = DataTypes;
exports.QueryTypes = QueryTypes;
