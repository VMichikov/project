const { db } = require("../../models/user.model");
const utils = require("../../utils/utils");
const path = require("path");

exports.login = async (req, res) => {
  try {
    user = await db.Users.findOne({
      where: { username: req.body.username, password: req.body.password },
    });
    if (user != null) {
      user.token = utils.generateToken();
      await user.save();
      console.log("Успешный вход");
    } else {
      throw new Error("Неверный логин или пароль");
    }
    let token = user.token;
    // TODO:notification check
    res.send(JSON.stringify({ token: token }));
  } catch (e) {
    res.status(401).send(JSON.stringify({ error: e.message }));
  }
};

exports.signup = async (req, res) => {
  try {
    let emailcheck = await db.Users.findOne({
      where: { email: req.body.email },
    });
    if (emailcheck != null) {
      throw new Error("Пользователь с такой почтой уже есть");
    }
    if (/\d/.test(req.body.username.charAt(0))) {
      throw new Error("Первый символ имени не может быть цифрой");
    }
    // Если не содержит англ символов
    if (/[^a-zA-Z]/.test(req.body.username)) {
      // Если не содержит русских символов
      if (/[^а-яА-Я]/.test(req.body.username)) {
        throw new Error("Буквы разных алфавитов не должны сочетаться в имени");
      }
    }

    let token = utils.generateToken();
    let user = await db.Users.create({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      is_premium: false,
      is_deleted: false,
      status: 1,
      token: token,
    });
    res.send(user);
  } catch (e) {
    res.status(401).send(JSON.stringify({ error: e.message }));
  }
};
