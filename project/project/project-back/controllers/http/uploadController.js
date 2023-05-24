const path = require("path");
const fs = require("fs");
const fsp = require("fs").promises;
const os = require("os");
const Busboy = require("busboy");
const { db } = require("../../models/user.model");
const uploadDir = path.resolve(__dirname, "..", "..", "upload");

exports.uploadHandler = async (req, res) => {
  const busboy = new Busboy({ headers: req.headers });
  let fileName;
  let fileHash;
  let chunkHash;
  let fileExtention;
  let token;
  let isFileExists = false;
  let isTokenCorrect = true;
  busboy.on("field", (fieldname, val) => {
    if (fieldname === "fileName") {
      fileName = val;
    } else if (fieldname === "fileHash") {
      fileHash = val;
    } else if (fieldname === "chunkHash") {
      chunkHash = val;
    } else if (fieldname === "fileExtention") {
      fileExtention = val;
    } else if (fieldname === "token") {
      token = val;
    }
  });

  busboy.on("file", async (_, file) => {
    let user = await db.Users.findOne({
      where: { token: token },
    });
    if (user != null) {
      // const chunkDir = path.join(uploadDir, fileHash);
      // const filePath = path.join(uploadDir, fileHash, fileName);
      const chunkDir = path.join(uploadDir, user.user_id, fileHash);
      let filePath;
      if (fileExtention != "") {
        filePath = path.join(uploadDir, user.user_id, fileHash, fileName.concat(".").concat(fileExtention));
      } else {
        filePath = path.join(uploadDir, user.user_id, fileHash, fileName);
      }
      if (fs.existsSync(filePath)) {
        isFileExists = true;
        //return;
      }
      if (isFileExists) {
        file.resume();
      } else {
        if (!fs.existsSync(chunkDir)) {
          fs.mkdirSync(chunkDir, { recursive: true });
        }
        // save to system temp dir first, then move to upload dir
        const saveTo = path.join(chunkDir, chunkHash);
        const tmpSaveTo = path.join(os.tmpdir(), chunkHash);
        const stream = fs.createWriteStream(saveTo);
        stream.on("finish", () => fs.renameSync(saveTo, saveTo));
        file.pipe(stream);
      }
    } else {
      isTokenCorrect = false;
      file.resume();
    }
  });
  busboy.on("finish", () => {
    if (isFileExists) {
      res.statusCode = 200;
      res.send(JSON.stringify({ response: "file_exist" }));
    } else if (!isTokenCorrect) {
      res.statusCode = 200;
      res.send(JSON.stringify({ response: "incorrect_token" }));
    } else {
      res.statusCode = 200;
      res.send(JSON.stringify({ response: "file_uploaded" }));
    }
  });
  req.pipe(busboy);
};
exports.mergeHandler = async (req, res) => {
  // const { fileName, fileHash } = await parseBody(req);
  const { fileName, fileExtention, fileHash, token } = req.body;
  let user = await db.Users.findOne({
    where: { token: token },
  });
  if (user != null) {
    // const filePath = path.join(uploadDir, fileName);
    // const filePath = path.join(uploadDir, fileHash, fileName);
    // const chunkDir = path.join(uploadDir, fileHash);
    let filePath;
    if (fileExtention != "") {
      filePath = path.join(uploadDir, user.user_id, fileHash, fileName.concat(".").concat(fileExtention));
    } else {
      filePath = path.join(uploadDir, user.user_id, fileHash, fileName);
    }
    const chunkDir = path.join(uploadDir, user.user_id, fileHash);
    if (!fs.existsSync(filePath) && fs.existsSync(chunkDir)) {
      let chunks = fs.readdirSync(chunkDir);
      chunks.sort(function (a, b) {
        let aDashPos = a.indexOf("-");
        let aNumber = a.slice(aDashPos + 1);
        let bDashPos = b.indexOf("-");
        let bNumber = b.slice(bDashPos + 1);
        return parseInt(aNumber) - parseInt(bNumber);
      });
      chunks.forEach((chunk) => {
        const chunkPath = path.join(chunkDir, chunk);
        fs.appendFileSync(filePath, fs.readFileSync(chunkPath));
        fs.unlinkSync(chunkPath);
      });
      await db.Files.create({
        user_id: user.user_id,
        hash: fileHash,
        name: fileName,
        extention: fileExtention,
      });
      res.statusCode = 200;
      res.send(JSON.stringify({ response: "file_chunks_merged" }));
    } else {
      res.statusCode = 200;
      res.send(JSON.stringify({ response: "file_exist" }));
    }
  } else {
    res.statusCode = 200;
    res.send(JSON.stringify({ response: "incorrect_token" }));
  }
  //fs.rmdirSync(chunkDir);
};
exports.removeFile = async (req, res) => {
  try {
    const { fileName, fileExtention, fileHash, token } = req.body;
    if (fileName == "" || fileName == null || fileName == undefined) {
      res.statusCode = 200;
      res.send(JSON.stringify({ response: "incorrect_file_name" }));
      return;
    }
    if (fileExtention == null || fileExtention == undefined) {
      res.statusCode = 200;
      res.send(JSON.stringify({ response: "incorrect_file_extention" }));
      return;
    }
    if (fileHash == "" || fileHash == null || fileHash == undefined) {
      res.statusCode = 200;
      res.send(JSON.stringify({ response: "incorrect_file_hash" }));
      return;
    }
    if (token == "" || token == null || token == undefined) {
      res.statusCode = 200;
      res.send(JSON.stringify({ response: "incorrect_token" }));
      return;
    }
    let user = await db.Users.findOne({
      where: { token: token },
    });
    if (user != null) {
      // let filePath;
      // if (fileExtention != "") {
      //     filePath = path.join(uploadDir, user.user_id, fileHash, fileName.concat(".").concat(fileExtention));
      // } else {
      //     filePath = path.join(uploadDir, user.user_id, fileHash, fileName);
      // }
      const fileDir = path.join(uploadDir, user.user_id, fileHash);
      if (fs.existsSync(fileDir)) {
        let userFiles = await db.Files.findAll({
          where: {
            user_id: user.user_id,
          },
        });

        if (userFiles.length == 1 && userFiles[0].hash == fileHash) {
          //Remove user dir
          let f = await fsp.rmdir(path.join(uploadDir, user.user_id), { recursive: true });
        } else {
          let f = await fsp.rmdir(path.join(uploadDir, user.user_id, fileHash), { recursive: true });
        }
      }
      let f = await db.Files.destroy({
        where: { name: fileName, extention: fileExtention, hash: fileHash, user_id: user.user_id },
      });
      res.statusCode = 200;
      res.send(JSON.stringify({ response: "removed" }));
    } else {
      res.statusCode = 200;
      res.send(JSON.stringify({ response: "incorrect_token" }));
    }
  } catch (e) {
    res.statusCode = 200;
    res.send(JSON.stringify({ response: "unexpected_error" }));
  }
};
