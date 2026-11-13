const express = require("express");
const cors = require("cors");
require("dotenv").config();

const dbConnect = require("./db/dbConnect");
const SchemaInfo = require("./db/schemaInfo");
const UserRouter = require("./routes/UserRouter");
const PhotoRouter = require("./routes/PhotoRouter");

const app = express();
const PORT = process.env.PORT || 8081;

app.use(cors());
app.use(express.json());

app.get("/", (request, response) => {
  response.send({ message: "Hello from photo-sharing app API!" });
});

// Returns the SchemaInfo object of the database.
app.get("/test/info", async (request, response) => {
  try {
    const info = await SchemaInfo.findOne({})
      .select("_id version load_date_time")
      .lean();
    if (!info) {
      response.status(500).json({ message: "SchemaInfo not found." });
      return;
    }
    response.status(200).json(info);
  } catch (err) {
    response.status(500).json({ message: "Internal server error." });
  }
});

app.use("/user", UserRouter);
app.use("/", PhotoRouter);

dbConnect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  })
  .catch(() => process.exit(1));

