const mongoose = require("mongoose");

const landmarkSchema = new mongoose.Schema(
  {
    _imgDims: { type: Object },
    _shift: { type: Object },
    _positions: { type: [Array] },
  },
  { _id: false }
);

const detectionSchema = new mongoose.Schema(
  {
    _imageDims: { type: Object },
    _score: { type: Number },
    _classScore: { type: Number },
    _className: { type: String },
    _box: { type: Object },
  },
  { _id: false }
);

const descriptorSchema = new mongoose.Schema(
  {
    type: Object,
  },
  { _id: false }
);

const faceDataSchema = new mongoose.Schema(
  {
    detection: { type: detectionSchema },
    landmarks: { type: landmarkSchema },
    unshiftedLandmarks: { type: landmarkSchema },
    alignedRect: { type: detectionSchema },
    descriptor: { type: Object },
  },
  { _id: false }
);

const credentialSchema = new mongoose.Schema({
  url: { type: String },
  fields: [{ type: Object }],
});

const userSchema = new mongoose.Schema({
  uname: { type: String },
  faceData: { type: faceDataSchema },
  credentials: { type: [credentialSchema] },
});

const User = mongoose.model("users", userSchema);

module.exports = User;
