const mongoose = require("mongoose");

/**
 * Define the Mongoose Schema for a User.
 */
const userSchema = new mongoose.Schema({
  first_name: { type: String },
  last_name: { type: String },
  location: { type: String },
  description: { type: String },
  occupation: { type: String },
});

/**
 * Create a Mongoose Model for a User using the userSchema.
 */
const User = mongoose.models.Users || mongoose.model("Users", userSchema);

module.exports = User;
