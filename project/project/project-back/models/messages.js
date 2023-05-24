module.exports = (sequelize, DataTypes) => {
  const Messages = sequelize.define(
    "messages",
    {
      //id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      text: DataTypes.STRING(20),
      date: DataTypes.DATE(6),
      source_id: DataTypes.BIGINT,
      destination_id: DataTypes.BIGINT,
      is_pinned: DataTypes.BOOLEAN,
      is_pending: DataTypes.INTEGER,
    },
    { freezeTableName: true }
  );
  //Messages.removeAttribute("id");
  return Messages;
};
