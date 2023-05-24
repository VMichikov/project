const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/http/uploadController");
const cors = require("cors");
router.use(cors());

router.post("/uploadFile", uploadController.uploadHandler);
router.post("/merge", uploadController.mergeHandler);
router.post("/removeFile", uploadController.removeFile);
module.exports = router;
