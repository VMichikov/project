const express = require("express");
const router = express.Router();
const authController = require("../controllers/http/authController");
const cors = require("cors");
router.use(cors());

router.post("/login", authController.login);
router.post("/signup", authController.signup);
module.exports = router;
