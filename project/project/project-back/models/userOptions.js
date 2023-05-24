module.exports = (sequelize, DataTypes) => {
  const UserOptions = sequelize.define(
    "user_options",
    {
      dark_theme: DataTypes.BOOLEAN,
    },
    { freezeTableName: true }
  );
  //UserOptions.removeAttribute("id");
  return UserOptions;
};
