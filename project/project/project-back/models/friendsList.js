const Users = require("./users");
module.exports = (sequelize, DataTypes) => {
  const FriendsList = sequelize.define(
    "friends_list",
    {
      user_id: {
        type: DataTypes.BIGINT,
        // references: {
        //     model: "user", // 'fathers' refers to table name
        //     key: "user_id", // 'id' refers to column name in fathers table
        // },
      },
      friend_id: DataTypes.BIGINT,
      is_approved: DataTypes.BOOLEAN,
    },
    { freezeTableName: true }
  );
  FriendsList.removeAttribute("id");
  Users.associate = function (models) {
    Users.belongsTo(Users, {
      foreignKey: "user_id",
    });
  };
  return FriendsList;
};
