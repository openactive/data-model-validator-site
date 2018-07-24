const express = require('express');
const validator = require('openactive-data-model-validator');
const bodyParser = require('body-parser');

// List on port 8080
const server = {
  createServer: (port, callback) => {
    const app = express();

    // for parsing application/json
    app.use(bodyParser.json());

    // React static files build to here
    app.use(express.static('dist'));

    // API route to validator
    app.post('/api/validate', (req, res) => {
      const json = req.body;
      let parsedJson;
      if (typeof json !== 'object') {
        try {
          parsedJson = JSON.parse(json);
        } catch (e) {
          res.status(400).json([
            {
              message: 'Invalid JSON',
            },
          ]);
          return;
        }
      } else {
        parsedJson = json;
      }
      const response = validator.validate(parsedJson);
      res.status(200).json(response);
    });

    return app.listen(port, callback);
  },
};

module.exports = server;
