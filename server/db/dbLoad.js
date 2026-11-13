/**
 * This Node.js program loads the Project 4 model data into MongoDB.
 * It erases whatever is in the database before loading, so it is safe to
 * run multiple times.
 *
 *   node ./db/dbLoad.js
 */
const dns = require("dns");
const mongoose = require("mongoose");
require("dotenv").config();

try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {}

const models = require("../modelData/models.js");

const User = require("./userModel.js");
const Photo = require("./photoModel.js");
const SchemaInfo = require("./schemaInfo.js");

const versionString = "1.0";

/**
 * The model dates look like "2016-01-04 2:00:01" (local time). Convert them
 * into a Date in a way that works on every JS engine.
 */
function toDate(str) {
  const m = String(str).match(
    /^(\d{4})-(\d{1,2})-(\d{1,2})[ T](\d{1,2}):(\d{1,2}):(\d{1,2})$/
  );
  if (!m) return new Date(str);
  return new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]);
}

async function dbLoad() {
  const url = process.env.DB_URL || "mongodb://127.0.0.1:27017/photo-sharing";
  try {
    await mongoose.connect(url);
    console.log("Successfully connected to MongoDB!");
  } catch (error) {
    console.error("Unable to connect to MongoDB!", error);
    process.exit(1);
  }

  // Remove everything first.
  await Promise.all([
    User.deleteMany({}),
    Photo.deleteMany({}),
    SchemaInfo.deleteMany({}),
  ]);

  // Load users. We keep the original _id values from the model data
  // (they are valid 24-hex-character ObjectIds).
  const userModels = models.userListModel();
  for (const u of userModels) {
    await User.create({
      _id: u._id,
      first_name: u.first_name,
      last_name: u.last_name,
      location: u.location,
      description: u.description,
      occupation: u.occupation,
    });
    console.log("Adding user:", u.first_name + " " + u.last_name);
  }

  // Load photos (with their embedded comments).
  let photoModels = [];
  for (const u of userModels) {
    photoModels = photoModels.concat(models.photoOfUserModel(u._id));
  }
  for (const p of photoModels) {
    await Photo.create({
      _id: p._id,
      file_name: p.file_name,
      date_time: toDate(p.date_time),
      user_id: p.user_id,
      comments: (p.comments || []).map((c) => ({
        _id: c._id,
        comment: c.comment,
        date_time: toDate(c.date_time),
        user_id: c.user._id,
      })),
    });
    console.log(
      "Adding photo:",
      p.file_name,
      "with",
      (p.comments || []).length,
      "comments"
    );
  }

  // Create the SchemaInfo object.
  const schemaInfo = await SchemaInfo.create({ version: versionString });
  console.log("SchemaInfo object created with version", schemaInfo.version);

  await mongoose.disconnect();
  console.log("Done.");
}

dbLoad().catch(async (err) => {
  console.error("Error loading database:", err);
  await mongoose.disconnect();
  process.exit(1);
});

