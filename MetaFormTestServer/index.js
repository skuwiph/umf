var express = require("express");
var cors = require('cors');
var app = express();

app.get("/url", (req, res, next) => {
    res.json(["Tony", "Lisa", "Michael", "Ginger", "Food"]);
});

app.get("/option", cors(), (req, res, next) => {
    res.json([
        { 'code': 'UK', 'description': 'United Kingdom' },
        { 'code': 'DE', 'description': 'Germany' },
        { 'code': 'ES', 'description': 'Spain' },
        { 'code': 'FR', 'description': 'France' },
        { 'code': 'PT', 'description': 'Portugal' },
    ]);
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
})