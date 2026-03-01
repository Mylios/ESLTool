const express = require('express');
const app = express();


app.use(express.static("../files"));

app.get("/", (req, res) => {
    console.log("req received");
    res.sendFile(__dirname + "/pages/index.html");
});

app.listen(3000, () => {
    console.log("Sup, we runnin");
});