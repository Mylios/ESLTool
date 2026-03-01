const express = require('express');
const path = require("path");
const app = express();
const fs = require("fs");
const axios = require("axios");




app.use(express.static(path.join(__dirname, "files")));
app.use(express.static(path.join(__dirname, "pages")));

app.get("/", (req, res) => {
    console.log("req received");
    res.sendFile(__dirname + "/pages/index.html");
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

app.get("/esls", async (req, res) => {
  try {
    const response = await axios.get("http://localhost:8080/api/esls");

    res.json(response.data);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Spring server failed" });
  }
});

app.listen(3000, () => {
    console.log("Sup, we runnin");
});