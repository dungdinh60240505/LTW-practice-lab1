const express = require("express");
const Photo = require("../db/photoModel");
const User = require("../db/userModel");
const { isValidId } = require("./util");

const router = express.Router();

/**
 * Build a map userId -> { _id, first_name, last_name } for the given ids.
 */
async function loadMinimalUsers(ids) {
  const unique = [...new Set(ids.map((id) => String(id)))];
  if (unique.length === 0) return {};
  const users = await User.find({ _id: { $in: unique } })
    .select("_id first_name last_name")
    .lean();
  const map = {};
  users.forEach((u) => {
    map[u._id.toString()] = u;
  });
  return map;
}

/**
 * GET /photosOfUser/:id
 * Return the photos of the user with (_id, user_id, comments, file_name, date_time).
 * Each comment has (comment, date_time, _id, user) where user is
 * (_id, first_name, last_name).
 */
router.get("/photosOfUser/:id", async (request, response) => {
  const { id } = request.params;
  if (!isValidId(id)) {
    response.status(400).json({ message: `Invalid user id: ${id}` });
    return;
  }
  try {
    // The user lookup and the photo lookup are independent -> run concurrently.
    const [owner, photos] = await Promise.all([
      User.exists({ _id: id }),
      Photo.find({ user_id: id })
        .select("_id user_id comments file_name date_time")
        .lean(),
    ]);
    if (!owner) {
      response.status(400).json({ message: `User with id ${id} not found.` });
      return;
    }

    const commenterIds = [];
    photos.forEach((p) =>
      (p.comments || []).forEach((c) => commenterIds.push(c.user_id))
    );
    const userMap = await loadMinimalUsers(commenterIds);

    // Build brand-new plain objects with exactly the API fields.
    const result = photos.map((p) => ({
      _id: p._id,
      user_id: p.user_id,
      file_name: p.file_name,
      date_time: p.date_time,
      comments: (p.comments || []).map((c) => ({
        _id: c._id,
        comment: c.comment,
        date_time: c.date_time,
        user: userMap[String(c.user_id)] || null,
      })),
    }));
    response.status(200).json(result);
  } catch (err) {
    console.error("/photosOfUser/:id error:", err);
    response.status(500).json({ message: "Internal server error." });
  }
});

/**
 * GET /commentsOfUser/:id   (Extra credit)
 * Return all comments authored by the user, each with the photo it was made on:
 * [{ _id, comment, date_time, photo: { _id, file_name, user_id } }]
 */
router.get("/commentsOfUser/:id", async (request, response) => {
  const { id } = request.params;
  if (!isValidId(id)) {
    response.status(400).json({ message: `Invalid user id: ${id}` });
    return;
  }
  try {
    const [owner, photos] = await Promise.all([
      User.exists({ _id: id }),
      Photo.find({ "comments.user_id": id })
        .select("_id user_id file_name comments")
        .lean(),
    ]);
    if (!owner) {
      response.status(400).json({ message: `User with id ${id} not found.` });
      return;
    }

    const result = [];
    photos.forEach((p) => {
      (p.comments || []).forEach((c) => {
        if (String(c.user_id) === id) {
          result.push({
            _id: c._id,
            comment: c.comment,
            date_time: c.date_time,
            photo: { _id: p._id, file_name: p.file_name, user_id: p.user_id },
          });
        }
      });
    });
    result.sort((a, b) => new Date(b.date_time) - new Date(a.date_time));
    response.status(200).json(result);
  } catch (err) {
    console.error("/commentsOfUser/:id error:", err);
    response.status(500).json({ message: "Internal server error." });
  }
});

module.exports = router;

