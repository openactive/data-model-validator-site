const express = require('express');
const validator = require('openactive-data-model-validator');
const bodyParser = require('body-parser');
const compression = require('compression');
const request = require('request');
const fs = require('fs');
const path = require('path');
const consts = require('../client/data/consts');

// List on port 8080
const server = class {
  static createServer(port, callback) {
    const app = express();

    // for parsing application/json
    app.use(bodyParser.json());

    // GZip
    app.use(compression());

    // React static files build to here
    app.use(
      express.static('dist', { index: 'index.html' }),
    );

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
      res.status(200).json(
        this.doValidation(parsedJson),
      );
    });

    // API route to validate url
    app.post('/api/validateUrl', (req, res) => {
      // Is this a valid URL?
      request.get(req.body.url, (error, response, body) => {
        let json = body;
        if (typeof json === 'string') {
          try {
            json = JSON.parse(json);
          } catch (e) {
            json = null;
          }
        }
        if (typeof json === 'object' && json !== null) {
          res.status(200).json(
            this.doValidation(json),
          );
          return;
        }
        res.status(400).json(
          {
            json: null,
            response: [{
              path: 'url',
              severity: 'failure',
              message: 'The url that you have provided does not contain a valid JSON document.',
            }],
          },
        );
      });
    });

    // Send everything else to react
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, '..', '..', 'dist', 'index.html'));
    });

    return app.listen(port, callback);
  }

  static doValidation(json) {
    return {
      isRpdeFeed: validator.isRpdeFeed(json),
      json,
      response: validator.validate(json, this.getValidateOptions()),
    };
  }

  static getValidateOptions() {
    const options = {
      activityLists: [],
      schemaOrgSpecifications: [],
      rpdeItemLimit: consts.FEED_ITEM_LIMIT,
    };
    const cacheDir = path.join(__dirname, '../../cache');

    const activityListFile = path.join(cacheDir, 'activityList.json');
    if (fs.existsSync(activityListFile)) {
      let activityList;
      try {
        activityList = JSON.parse(
          fs.readFileSync(activityListFile),
        );
      } catch (e) {
        activityList = null;
      }
      if (typeof activityList === 'object' && activityList !== null) {
        options.activityLists.push(activityList);
      }
    }

    const schemaOrgSpecFile = path.join(cacheDir, 'schemaOrgSpec.json');
    if (fs.existsSync(schemaOrgSpecFile)) {
      let schemaOrgSpec;
      try {
        schemaOrgSpec = JSON.parse(
          fs.readFileSync(schemaOrgSpecFile),
        );
      } catch (e) {
        schemaOrgSpec = null;
      }
      if (typeof schemaOrgSpec === 'object' && schemaOrgSpec !== null) {
        options.schemaOrgSpecifications.push(schemaOrgSpec);
      }
    }

    return options;
  }
};

module.exports = server;
