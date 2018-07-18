const express = require('express');
const validator = require('openactive-data-model-validator');
const bodyParser = require('body-parser');

// set the port of our application
// process.env.PORT lets the port be set by Heroku
const port = process.env.PORT || 8080;

const app = express();

// for parsing application/json
app.use(bodyParser.json());

// React static files build to here
app.use(express.static('dist'));

// API route to validator
app.post('/api/validate', (req, res) => {
    let json = req.body;
    if (typeof json !== 'object') {
        try {
            parsedJson = JSON.parse(json);
        } catch (e) {
            res.status(400).json([{message: "Invalid JSON"}]);
            return;
        }
    } else {
        parsedJson = json;
    }
    let response = validator.validate(parsedJson);
    if (response.length) {
        res.status(400).json(response);
    } else {
        res.status(200).json(response);
    }
});

// List on port 8080
app.listen(port, () => console.log('Listening on port ' + port + '!'));
