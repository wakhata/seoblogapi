const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const memberSchema = new mongoose.Schema(
  {
    cname: {
      type: String,
      trim: true,
      min: 3,
      max: 160,
      required: true,
    },
    contact: {
      type: String,
      trim: true,
      min: 3,
      max: 160,
      required: true,
    },
    mobile: {
      type: String,
      trim: true,
      min: 3,
      max: 160,
      required: true,
    },
    address: {
      type: String,
      trim: true,
      min: 3,
      max: 160,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      min: 3,
      max: 160,
      required: true,
    },
    location: {
      type: String,
      trim: true,
      min: 3,
      max: 160,
      required: true,
    },
    excerpt: {
      type: String,
      max: 1000,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    body: {
      type: {},
      required: true,
      min: 200,
      max: 2000000,
    },
    photo: {
      data: Buffer,
      contentType: String,
    },
    categories: [{ type: ObjectId, ref: "Category", required: true }],
    tags: [{ type: ObjectId, ref: "Tag", required: true }],
    postedBy: {
      type: ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Member", memberSchema);
