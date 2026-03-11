const express = require('express');
const path = require("path");
const app = express();
const fs = require("fs");
const axios = require("axios");
const multer = require("multer");
const IP = "127.0.0.1";
const { promisify } = require('util');
const PORT = 8080;
const SPRINGP = 8081;

const unlinkAsync = promisify(fs.unlink);


app.use(express.static(path.join(__dirname, "files")));
app.use(express.static(path.join(__dirname, "html")));


const systemStorage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, 'files/tmp'); },
  filename: function (req, file, cb) { cb(null, file.originalname); }
});

const uploadStorage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, 'files/tmp'); },
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

app.get("/results", (req, res) => {
    console.log("req received");
    res.sendFile(__dirname + "/html/pages/exported.html");
});

app.delete("/delete/:id", (req,res)=>{
  // unlinkAsync(path.join(__dirname, "files", req.params.id));
  console.log("deleting" + `: http://${IP}:8080/api/delete/${req.params.id}`)
  fetch(`http://${IP}:${SPRINGP}/api/delete/${req.params.id}`,{method:"DELETE"});
});

app.get("/images/:id", (req, res) => {
  console.log(req.params.id);
  const uploadsPath = path.join(__dirname, "files", req.params.id);

  fs.readdir(uploadsPath, (err, files) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read directory" });
    }

    const pngFiles = files
      .filter(file => path.extname(file).toLowerCase() === ".png");

    res.json(pngFiles);
  });
});

app.post("/api/process",upload.single('file'), async (req, res) => {
  try {
    // const response = await axios.get("http://localhost:8080/api/esls");
    // res.json(response.data);
    toBackend(req,res,"api/esls");
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Spring server failed" });
  }
});

app.listen(PORT, () => {
    console.log("Frontend server running on " + PORT);
});





async function toBackend(req, res, url) {
  if (!req.file) return res.status(400).send('No file uploaded.');

  console.log(req.body);
  console.log(`File uploaded: ${req.file.originalname}`);

  const absolutePath = path.resolve(__dirname, 'files/tmp/' + req.file.originalname);

  const isles =
    (req.body.ailes === "{}")
      ? {}
      : JSON.parse(req.body.ailes);   // <-- important

  const response = await fetch(`http://${IP}:${SPRINGP}/` + url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filePath: absolutePath.toString(),
      isles: isles,
      addMissing: req.body.addMissing === "true"
    })
  });

  unlinkAsync(absolutePath);
  
  
  if (!response.ok) {
    res.setHeader('error', response.headers.get("error"));
    res.status = 400;
  }
  let data = await response.json();
  res.json(data);
}
