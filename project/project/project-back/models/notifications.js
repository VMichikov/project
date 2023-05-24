module.exports = (sequelize, DataTypes) => {
  const Notifications = sequelize.define(
    "notifications",
    {
      source_id: DataTypes.BIGINT,
      destination_id: DataTypes.BIGINT,
      type: DataTypes.STRING(100),
      count: DataTypes.BIGINT,
    },
    { freezeTableName: true }
  );
  return Notifications;
};
