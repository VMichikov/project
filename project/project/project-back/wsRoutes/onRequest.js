const authController = require("../controllers/ws/authController");
const utils = require("../utils/utils");
exports.onRequest = async (request) => {
  // if (!utils.originIsAllowed(request.origin)) {
  //   // Make sure we only accept requests from an allowed origin
  //   request.reject();
  //   console.log(new Date() + " Connection from origin " + request.origin + " rejected.");
  //   return;
  // }
  var connection = request.accept("echo-protocol", request.origin);
  // utils.sendMessage(
  //   connection,
  //   "notification",
  //   "add_friend",
  //   JSON.stringify({ srcId: ["123", "345"] })
  // );
  let isAuthorized = await authController.websocketAuth(request, connection);
  return [connection, isAuthorized];
};
