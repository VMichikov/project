const Users = require("./users");
module.exports = (sequelize, DataTypes) => {
  const Files = sequelize.define(
    "files",
    {
      user_id: { type: DataTypes.BIGINT },
      hash: DataTypes.STRING(128),
      name: DataTypes.STRING(400),
      extention: DataTypes.STRING(10),
    },
    { freezeTableName: true }
  );
  Files.associate = function (models) {
    Files.hasMany(Users, { foreignKey: "user_id" });
  };
  return Files;
};
