const express = require('express');
const validator = require('openactive-data-model-validator');
const { versions } = require('openactive-data-models');
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
    app.post('/api/validate/:version', (req, res) => {
      const json = req.body;
      const { version } = req.params;
      if (typeof versions[version] === 'undefined') {
        res.status(400).json([
          {
            message: 'Invalid version',
          },
        ]);
        return;
      }
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
    app.post('/api/validateUrl/:version', (req, res) => {
      const { version } = req.params;
      if (typeof versions[version] === 'undefined') {
        res.status(400).json([
          {
            message: 'Invalid version',
          },
        ]);
        return;
      }
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
    const cacheDir = path.join(__dirname, '../../cache');

    const options = {
      loadRemoteJson: true,
      remoteJsonCachePath: cacheDir,
      schemaOrgSpecifications: [],
      rpdeItemLimit: consts.FEED_ITEM_LIMIT,
    };

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
