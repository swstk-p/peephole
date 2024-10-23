const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./userSchema");
const RSA = require("./rsa");
require("dotenv").config();
const app = express();
const faceapi = require("face-api.js");

app.use(cors());
app.use(express.json());

const PORT = 5000;
const MONGOURL = "mongodb://localhost:27017/extension";

function decryptDocument(userInfo) {
  let responseObj = {};
  responseObj.uname = userInfo.uname;
  responseObj.faceData = userInfo.faceData;
  if (userInfo.credentials.length < 1) {
    responseObj.credentials = userInfo.credentials;
  } else {
    let privateKey = process.env.PRIVATE_KEY;
    privateKey = privateKey.split(",");
    for (let i = 0; i < privateKey.length; i++) {
      privateKey[i] = Number(privateKey[i]);
    }
    responseObj.credentials = [];
    for (const cred of userInfo.credentials) {
      let decryptedCred = {};
      decryptedCred.url = RSA.decrypt(privateKey, cred.url);
      decryptedCred.fields = [];
      for (const field of cred.fields) {
        let decryptedField = {};
        let fieldKeys = Object.keys(field);
        for (const fieldKey of fieldKeys) {
          let decryptedFieldKey = RSA.decrypt(privateKey, fieldKey);
          decryptedField[decryptedFieldKey] = RSA.decrypt(
            privateKey,
            field[fieldKey]
          );
        }
        decryptedCred.fields.push(decryptedField);
      }
      responseObj.credentials.push(decryptedCred);
    }
  }
  return responseObj;
}

app.get("/", (req, res) => {
  res.json({ page: "loaded" });
});

app.post("/register", async (req, res) => {
  const labeledFaceDescriptor = new faceapi.LabeledFaceDescriptors(
    req.body.uname,
    [new Float32Array(Object.values(req.body.faceData.descriptor))]
  );
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptor);

  let isNewUser = true;
  let isNewUname = true;

  const docs = await User.find();

  if (docs.length > 0) {
    for (let doc of docs) {
      if (doc !== req.body) {
        const bestMatch = faceMatcher.findBestMatch(
          new Float32Array(Object.values(doc.faceData.descriptor))
        );
        if (bestMatch.label !== "unknown" && bestMatch.distance < 0.5) {
          isNewUser = false;
          break;
        }
      }
    }
  }

  if (isNewUser) {
    if (docs.length > 0) {
      for (let doc of docs) {
        if (doc.uname == req.body.uname) {
          isNewUname = false;
          break;
        }
      }
    }
  }
  if (isNewUser && isNewUname) {
    const result = await User.create({
      uname: req.body.uname,
      faceData: req.body.faceData,
      credentials: req.body.credentials,
    });
    res.json({ msg: "registered" });
  } else if (isNewUser) {
    res.json({ msg: "oldUname" });
  } else {
    res.json({ msg: "oldUser" });
  }
});

app.post("/login", async (req, res) => {
  console.log("New login query");

  const queryDescriptorArr = new Float32Array(
    Object.values(req.body.queryFace.descriptor)
  );

  let userInfo = null;
  let lowestDist = null;

  const docs = await User.find();
  if (docs.length > 0) {
    for (let doc of docs) {
      const labeledFaceDescriptor = new faceapi.LabeledFaceDescriptors(
        doc.uname,
        [new Float32Array(Object.values(doc.faceData.descriptor))]
      );
      const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptor);
      const bestMatch = faceMatcher.findBestMatch(queryDescriptorArr);
      // console.log("matchData:", bestMatch);

      if (bestMatch.label !== "unknown" && bestMatch.distance < 0.5) {
        if (lowestDist == null) {
          userInfo = doc;
          lowestDist = bestMatch.distance;
        } else if (lowestDist > bestMatch.distance) {
          userInfo = doc;
          lowestDist = bestMatch.distance;
        }
      }
    }
  }
  if (userInfo !== null) {
    userInfo = decryptDocument(userInfo);
  }

  let publicKey = process.env.PUBLIC_KEY;
  publicKey = publicKey.split(",");
  for (let i = 0; i < publicKey.length; i++) {
    publicKey[i] = Number(publicKey[i]);
  }

  if (userInfo !== null) {
    res.json({ userInfo: userInfo, publicKey: publicKey });
  } else {
    res.json({ userInfo: { uname: "No match" }, publicKey: null });
  }
});

app.put("/credential", async (req, res) => {
  console.log("HERE");
  console.log("Req:", req.body);

  let user = req.body.user;
  let credData = req.body.credData;
  let result = null;
  result = await User.findOneAndUpdate(
    {
      uname: user,
      credentials: {
        $elemMatch: {
          url: credData.url,
        },
      },
    },
    {
      $push: {
        "credentials.$.fields": {
          $each: credData.fields,
        },
      },
    },
    { new: true }
  );
  if (result == null) {
    result = await User.findOneAndUpdate(
      { uname: user },
      { $push: { credentials: credData } },
      { new: true }
    );
  }
  let responseObj = decryptDocument(result);
  console.log("Res:", responseObj);

  res.json({ userInfo: responseObj });
});

app.get("/key", (req, res) => {
  let publicKey = process.env.PUBLIC_KEY;
  publicKey = publicKey.split(",");
  for (let i = 0; i < publicKey.length; i++) {
    publicKey[i] = Number(publicKey[i]);
  }
  console.log("public key:", publicKey);
  res.json({ publicKey: publicKey });
});

app.delete("/credential", async (req, res) => {
  let privateKey = process.env.PRIVATE_KEY;
  privateKey = privateKey.split(",");
  for (let i = 0; i < privateKey.length; i++) {
    privateKey[i] = Number(privateKey[i]);
  }

  let url = req.body.url;
  let user = RSA.decrypt(privateKey, req.body.user);
  let result = await User.findOneAndUpdate(
    { uname: user },
    { $pull: { credentials: { url: url } } },
    { new: true }
  );

  let responseObj = decryptDocument(result);
  console.log("RESPONSE OBJ:", responseObj);

  res.json({ userInfo: responseObj });
});

app.put("/account", async (req, res) => {
  let privateKey = process.env.PRIVATE_KEY;
  privateKey = privateKey.split(",");
  for (let i = 0; i < privateKey.length; i++) {
    privateKey[i] = Number(privateKey[i]);
  }
  let user = RSA.decrypt(privateKey, req.body.user);
  let newFaceData = req.body.newFaceData;
  let result = await User.findOneAndUpdate(
    { uname: user },
    { $set: { faceData: newFaceData } }
  );

  let responseObj = decryptDocument(result);
  res.json({ userInfo: responseObj });
});

app.delete("/account", async (req, res) => {
  let privateKey = process.env.PRIVATE_KEY;
  privateKey = privateKey.split(",");
  for (let i = 0; i < privateKey.length; i++) {
    privateKey[i] = Number(privateKey[i]);
  }

  let decryptedUser = RSA.decrypt(privateKey, req.body.user);
  let result = await User.findOneAndDelete({ uname: decryptedUser });
  if (result !== null) {
    res.json({ deleted: true });
  }
});

mongoose
  .connect(MONGOURL)
  .then(async () => {
    console.log("Connected to database successfully.");
    // await faceapi.nets.tinyFaceDetector.loadFromUri("./models");
    // await faceapi.nets.faceLandmark68Net.loadFromUri("./models");
    // await faceapi.nets.faceLandmark68TinyNet.loadFromUri("./models");
    // await faceapi.nets.faceRecognitionNet.loadFromUri("./models");

    app.listen(PORT, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch((err) => {
    console.log(err);
  });
