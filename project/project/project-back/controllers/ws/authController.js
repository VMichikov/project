const { db } = require("../../models/user.model");
exports.websocketAuth = async (request, connection) => {
  let indexOfFirst = request.resource.indexOf("token="); // парсит строку подключения вебсокета и извлекает токен
  let parsedToken = request.resource.slice(indexOfFirst + 6); // парсит строку подключения вебсокета и извлекает токен
  let isAuthorized;
  // аутентифицирует пользователя по переданному в нее токену, бд симулирует переменная выше
  let user = await db.Users.findOne({ where: { token: parsedToken } });
  if (user == null) {
    //change in real DB
    connection.sendUTF(JSON.stringify({ event: "tokenInfo", payload: "tokenError" }));
    //Timeout is for method of checking the validness of token via ws in App.jsx's. Without it slow client may not be capable to trigger the required condition.
    setTimeout(() => {
      connection.close();
    }, 300);

    isAuthorized = false;
  } else {
    console.log(new Date() + " Connection accepted."); // Delete on production
    connection.sendUTF(JSON.stringify({ event: "tokenInfo", payload: "tokenIsValid" }));
    connection.userId = user.user_id;
    isAuthorized = true;
    connection.sendUTF(JSON.stringify({ event: "connectionResponse", userId: user.user_id })); //For front-end dialog.jsx component
  }
  return isAuthorized;
};
