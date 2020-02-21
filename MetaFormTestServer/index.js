var express = require("express");
var cors = require('cors');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.get("/url", (req, res, next) => {
    res.json(["Tony", "Lisa", "Michael", "Ginger", "Food"]);
});

//allow OPTIONS on all resources
app.options('*', cors());
app.post('*', cors());

app.get("/country", cors(), (req, res, next) => {
    res.json([
        { 'code': 'UK', 'description': 'United Kingdom' },
        { 'code': 'DE', 'description': 'Germany' },
        { 'code': 'ES', 'description': 'Spain' },
        { 'code': 'FR', 'description': 'France' },
        { 'code': 'PT', 'description': 'Portugal' },
    ]);
});

app.get("/country/:countryCode/regions", cors(), (req, res, next) => {
    var countryCode = req.params.countryCode.toUpperCase();
    if (countryCode === 'UK') {
        res.json([
            { 'code': '1', 'description': 'Scotland' },
            { 'code': '2', 'description': 'Northern Ireland' },
            { 'code': '3', 'description': 'Wales' },
            { 'code': '4', 'description': 'England' }
        ]);
    } else if (countryCode === 'DE') {
        res.json([
            { 'code': '5', 'description': 'Baden-Württemberg' },
            { 'code': '6', 'description': 'Bavaria' },
            { 'code': '7', 'description': 'Berlin' },
            { 'code': '8', 'description': 'Hamburg' },
            { 'code': '9', 'description': 'Bremen' },
            { 'code': '10', 'description': 'Saxony' },
            { 'code': '11', 'description': 'North Rhine-Westphalia' }
        ]);
    } else {
        res.json([
            { 'code': '99', 'description': 'Default Region' }
        ]);
    }
});

app.post("/validate/email", cors(), (req, res, next) => {
    var check = req.body.check.toLowerCase();
    console.log(`Validate email called with '${check}'`);

    if (check === 'fail@example.com') {
        res.json(
            { 'valid': false }
        );
    } else {
        res.json(
            { 'valid': true }
        );
    }
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
})