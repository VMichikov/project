const FriendsList = require("./friendsList");
const Files = require("./files");
module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define(
    "users",
    {
      user_id: { type: DataTypes.BIGINT },
      username: DataTypes.STRING(26),
      password: DataTypes.STRING(100),
      email: DataTypes.STRING(100),
      phone: DataTypes.STRING(22),
      is_premium: DataTypes.BOOLEAN,
      is_deleted: DataTypes.BOOLEAN,
      last_active: DataTypes.DATEONLY,
      avatar_id: DataTypes.BIGINT,
      status: DataTypes.INTEGER,
      status_message: DataTypes.STRING(100),
      token: DataTypes.STRING(24),
    },
    { freezeTableName: true }
  );
  Users.removeAttribute("id");
  Users.associate = function (models) {
    Users.hasMany(FriendsList, { foreignKey: "user_id", onDelete: "CASCADE" });
  };
  Files.associate = function (models) {
    Users.belongsTo(Users, {
      foreignKey: "user_id",
    });
  };
  return Users;
};
