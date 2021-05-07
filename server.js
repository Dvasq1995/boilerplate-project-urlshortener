require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const shortid = require("shortid");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  } catch (err) {
    console.log(err);
  }
};

connectDB();

const { Schema } = mongoose;
const urlSchema = new Schema({ original_url: String, short_url: String });
const shorturl = mongoose.model("shorturl", urlSchema);

const protocol = new RegExp("https://", "i");

const saveUrlDoc = async urlDoc => {
  try {
    await urlDoc.save();
  } catch (err) {
    console.log(err);
  }
};

const app = express();

const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", (req, res) => {
  res.sendFile(`${process.cwd()}/views/index.html`);
});

app.post("/api/shorturl", (req, res) => {
  const { url } = req.body;
  if (protocol.test(url) === false) {
    res.json({ error: "invalid url" });
  } else {
    const urlObj = { original_url: url, short_url: shortid.generate() };
    const urlDoc = new shorturl(urlObj);
    saveUrlDoc(urlDoc);
    res.json(urlObj);
  }
});

app.get("/api/shorturl/:short_url", async (req, res) => {
  const { short_url } = req.params;
  const doc = await shorturl.findOne({ short_url }, "original_url");
  const { original_url } = doc;
  res.status(301).redirect(original_url);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
