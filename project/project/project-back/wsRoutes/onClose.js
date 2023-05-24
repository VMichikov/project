exports.onClose = (connection, reasonCode, description) => {
  connection.on("close", function (reasonCode, description) {
    console.log(new Date() + " Peer " + connection.remoteAddress + " disconnected.");
  });
};
