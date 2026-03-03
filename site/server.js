const express = require('express');
const path = require("path");
const app = express();
const fs = require("fs");
const axios = require("axios");
const multer = require("multer");



app.use(express.static(path.join(__dirname, "files")));
app.use(express.static(path.join(__dirname, "html")));


const systemStorage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, 'tmp'); },
  filename: function (req, file, cb) { cb(null, file.originalname); }
});

const uploadStorage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, 'tmp'); },
  filename: function (req, file, cb) { cb(null, file.originalname); }
});

const save = multer({ storage: systemStorage });
const upload = multer({ storage: uploadStorage });

app.post('/upload', save.single('file'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded.');
  console.log(`File uploaded: ${req.file.originalname}`);
  res.send(`File '${req.file.originalname}' uploaded successfully.`);
});


app.get("/", (req, res) => {
    console.log("req received");
    res.sendFile(__dirname + "/html/pages/index.html");
});

app.get("/images", (req, res) => {
  const uploadsPath = path.join(__dirname, "files");

  fs.readdir(uploadsPath, (err, files) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read directory" });
    }

    const pngFiles = files
      .filter(file => path.extname(file).toLowerCase() === ".png");

    res.json(pngFiles);
  });
});

app.get("/esls",upload.single('file'), async (req, res) => {
  try {
    // const response = await axios.get("http://localhost:8080/api/esls");
    // res.json(response.data);
    toBackend(req,res,"")
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Spring server failed" });
  }
});

app.listen(3000, () => {
    console.log("Sup, we runnin");
});





async function toBackend(req, res, url) {
  if (!req.file) return res.status(400).send('No file uploaded.');
  console.log(`File uploaded: ${req.file.originalname}`);
  const absolutePath = path.resolve(__dirname, 'files/tmp/' + req.file.originalname);
  const response = await fetch(`http://${IP}:8080/` + url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filePath: absolutePath.toString(), isles: req.isles, addMissing: req.addMissing })
  });
  unlinkAsync(absolutePath);
  if (!response.ok) {
    res.setHeader('error', response.headers.get("error"));
    res.status = 400;
  }
  res.setHeader('Content-Disposition', response.headers.get('content-disposition'));
  res.setHeader('Content-Type', response.headers.get('content-type'));
  const buffer = Buffer.from(await response.arrayBuffer());
  res.send(buffer);
}