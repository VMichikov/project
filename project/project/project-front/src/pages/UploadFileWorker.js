export const uploadFile = async (file, fileHash, token) => {
  // The object that the web page sent is stored in the event.data property.
  // var file = event.data.file;

  // Using that number range, perform the prime number search.
  var upload = await readBlob(file, fileHash, token);

  // Now the search is finished. Send back the results.
  postMessage({ type: "upload", isUploaded: true, response: { upload: upload, hash: fileHash, fullName: file.name } });
};
//only this function is in use, because for now uploading starts only after hashing
export const hashFile = async (file, token) => {
  try {
    var fileHash = await readBlobHash(file);
    postMessage({
      type: "hash",
      isHashed: true,
      response: { fullName: file.name },
    });

    await uploadFile(file, fileHash, token);
  } catch (e) {
    postMessage({
      type: "error",
      response: { fullName: file.name, message: e.message },
    });
  }
};
function readFileAsync(blob, reader) {
  return new Promise((resolve, reject) => {
    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = reject;

    reader.readAsArrayBuffer(blob);
  });
}
async function readBlob(file, fileHash, token) {
  // 200 MegaBytes
  // let chunkSize = 209715200;
  // 10 MegaBytes
  let chunkSize = 10485760;
  let chunksAmount = Math.ceil(file.size / chunkSize);
  let reader = new FileReader();

  let responseTypes = ["succesfull", "usuccesfull", "alreadyExists", "incorrectToken"];
  let workerResponse = responseTypes[0];
  let fileExtention = file.name.slice(((file.name.lastIndexOf(".") - 1) >>> 0) + 2);
  let fileName;
  if (fileExtention === "") {
    fileName = file.name;
  } else {
    fileName = file.name.slice(0, file.name.length - fileExtention.length - 1);
  }
  for (let i = 0; i < chunksAmount; ++i) {
    if (i < chunksAmount - 1) {
      var blob = file.slice(i * chunkSize, (i + 1) * chunkSize);
      let result = await readFileAsync(blob, reader);
      const formData = new FormData();
      formData.append("fileName", fileName);
      formData.append("fileHash", fileHash);
      formData.append("chunkHash", `chunk-${i}`);
      formData.append("fileExtention", fileExtention);
      formData.append("token", token);
      formData.append("chunk", new File(""));
      let requestOptions = {
        method: "POST",
        headers: { enctype: "multipart/form-data" },
        body: formData,
      };
      //TODO:change the string adress to the the global var from the config.json or smth like that.
      let response = await fetch("https://localhost:4000/api/upload/uploadFile", requestOptions);
      let data = await response.json();
      if (response.status === 200) {
        if (data.response === "file_exist") {
          return responseTypes[2];
        } else if (data.response === "file_uploaded") {
          workerResponse = responseTypes[0];
          postMessage({
            type: "upload",
            isUploaded: false,
            response: { progress: Math.floor((i / (chunksAmount - 1)) * 100), hash: fileHash, fullName: file.name },
          });
        } else if (data.response === "incorrect_token") {
          return responseTypes[3];
        }
      } else {
        return responseTypes[1];
      }
    } else {
      var blob = file.slice(i * chunkSize, file.size);
      let result = await readFileAsync(blob, reader);
      const formData = new FormData();
      formData.append("fileName", fileName);
      formData.append("fileHash", fileHash);
      formData.append("chunkHash", `chunk-${i}`);
      formData.append("fileExtention", fileExtention);
      formData.append("token", token);
      formData.append("chunk", new File(""));
      let requestOptions = {
        method: "POST",
        headers: { enctype: "multipart/form-data" },
        body: formData,
      };
      //TODO:change the string adress to the the global var from the config.json or smth like that.
      let response = await fetch("https://localhost:4000/api/upload/uploadFile", requestOptions);
      let data = await response.json();
      if (response.status === 200) {
        if (data.response === "file_exist") {
          return responseTypes[2];
        } else if (data.response === "file_uploaded") {
          workerResponse = responseTypes[0];
          postMessage({
            type: "upload",
            isUploaded: false,
            response: { progress: chunksAmount === 1 ? 100 : Math.floor((i / (chunksAmount - 1)) * 100), hash: fileHash, fullName: file.name },
          });
        } else if (data.response === "incorrect_token") {
          return responseTypes[3];
        }
      } else {
        return responseTypes[1];
      }
    }
  }
  return workerResponse;
}
async function readBlobHash(file) {
  // 200 MegaBytes
  // let chunkSize = 209715200;
  // 10 MegaBytes
  let chunkSize = 10485760;
  let chunksAmount = Math.ceil(file.size / chunkSize);
  let reader = new FileReader();
  for (let i = 0; i < chunksAmount; ++i) {
    if (i < chunksAmount - 1) {
      var blob = file.slice(i * chunkSize, (i + 1) * chunkSize);
      let result = await readFileAsync(blob, reader);
      postMessage({
        type: "hash",
        isHashed: false,
        response: { progress: Math.floor((i / (chunksAmount - 1)) * 100), fullName: file.name },
      });
    } else {
      var blob = file.slice(i * chunkSize, file.size);
      let result = await readFileAsync(blob, reader);
      postMessage({
        type: "hash",
        isHashed: false,
        response: { progress: chunksAmount === 1 ? 100 : Math.floor((i / (chunksAmount - 1)) * 100), fullName: file.name },
      });
    }
  }
}
