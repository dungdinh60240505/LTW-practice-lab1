const express = require("express");
const User = require("../db/userModel");
const Photo = require("../db/photoModel");
const { isValidId } = require("./util");

const router = express.Router();

/**
 * GET /user/list
 * Return the list of users for the navigation sidebar: (_id, first_name, last_name).
 */
router.get("/list", async (request, response) => {
  try {
    const users = await User.find({})
      .select("_id first_name last_name")
      .lean();
    response.status(200).json(users);
  } catch (err) {
    console.error("/user/list error:", err);
    response.status(500).json({ message: "Internal server error." });
  }
});

/**
 * GET /user/counts   (Extra credit)
 * Return, for every user, the number of photos they own and the number of
 * comments they authored: { [userId]: { photo_count, comment_count } }.
 */
router.get("/counts", async (request, response) => {
  try {
    const [users, photoCounts, commentCounts] = await Promise.all([
      User.find({}).select("_id").lean(),
      Photo.aggregate([{ $group: { _id: "$user_id", count: { $sum: 1 } } }]),
      Photo.aggregate([
        { $unwind: "$comments" },
        { $group: { _id: "$comments.user_id", count: { $sum: 1 } } },
      ]),
    ]);

    const result = {};
    users.forEach((u) => {
      result[u._id.toString()] = { photo_count: 0, comment_count: 0 };
    });
    photoCounts.forEach((p) => {
      const key = String(p._id);
      if (result[key]) result[key].photo_count = p.count;
    });
    commentCounts.forEach((c) => {
      const key = String(c._id);
      if (result[key]) result[key].comment_count = c.count;
    });
    response.status(200).json(result);
  } catch (err) {
    console.error("/user/counts error:", err);
    response.status(500).json({ message: "Internal server error." });
  }
});

/**
 * GET /user/:id
 * Return the details of one user:
 * (_id, first_name, last_name, location, description, occupation).
 */
router.get("/:id", async (request, response) => {
  const { id } = request.params;
  if (!isValidId(id)) {
    response.status(400).json({ message: `Invalid user id: ${id}` });
    return;
  }
  try {
    const user = await User.findById(id)
      .select("_id first_name last_name location description occupation")
      .lean();
    if (!user) {
      response.status(400).json({ message: `User with id ${id} not found.` });
      return;
    }
    response.status(200).json(user);
  } catch (err) {
    console.error("/user/:id error:", err);
    response.status(500).json({ message: "Internal server error." });
  }
});

module.exports = router;

