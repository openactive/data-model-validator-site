import express from 'express';
import validator from '@openactive/data-model-validator';
import { RpdeValidator } from '@openactive/rpde-validator';
import { versions } from '@openactive/data-models';
import bodyParser from 'body-parser';
import compression from 'compression';
import request from 'request';
import fs from 'fs';
import path from 'path';
import expressWs from 'express-ws';

// List on port 8080
const server = class {
  static createServer(port, callback) {
    const app = express();
    expressWs(app);

    // for parsing application/json
    app.use(bodyParser.json());

    // GZip
    app.use(compression());

    // React static files build to here
    app.use(
      express.static('dist/client', { index: 'index.html' }),
    );

    // API route to validator
    app.post('/api/validate/:version', (req, res) => {
      const json = req.body;
      const { version } = req.params;
      if (
        typeof versions[version] === 'undefined'
        && Object.values(versions).indexOf(version) < 0
      ) {
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
        this.doValidation(parsedJson, version),
      );
    });

    // API route to validate url
    app.post('/api/validateUrl/:version', (req, res) => {
      const { version } = req.params;
      if (
        typeof versions[version] === 'undefined'
        && Object.values(versions).indexOf(version) < 0
      ) {
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
            this.doValidation(json, version),
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

    app.ws('/ws', (ws) => {
      ws.on('message', (message) => {
        console.log(message);
        // Is this a URL?
        if (!message.match(/^http/)) {
          ws.send(JSON.stringify({
            type: 'error',
            data: 'You must submit a valid URL for validation',
          }));
        } else {
          // Do the validation
          console.log(`${new Date()} trying validation for ${message}`);
          const options = {
            logCallback: (log) => {
              if (log.verbosity === 1) {
                ws.send(JSON.stringify({
                  type: 'log',
                  url: message,
                  data: log,
                }));
              }
            },
            userAgent: process.env.REACT_APP_RPDE_USER_AGENT,
            timeoutMs: (
              process.env.REACT_APP_RPDE_TIMEOUT_MS
                ? parseInt(process.env.REACT_APP_RPDE_TIMEOUT_MS, 10)
                : null
            ),
            requestDelayMs: (
              process.env.REACT_APP_RPDE_REQUEST_DELAY_MS
                ? parseInt(process.env.REACT_APP_RPDE_REQUEST_DELAY_MS, 10)
                : null
            ),
            pageLimit: (
              process.env.REACT_APP_RPDE_PAGE_LIMIT
                ? parseInt(process.env.REACT_APP_RPDE_PAGE_LIMIT, 10)
                : null
            ),
          };
          RpdeValidator(
            message,
            options,
          ).then(
            (res) => {
              console.log(`${new Date()} validation completed`);
              ws.send(JSON.stringify({
                type: 'results',
                url: message,
                data: res,
              }));
            },
          ).catch(
            (err) => {
              console.error(`${new Date()} validation errored`);
              console.error(err);
              ws.send(JSON.stringify({
                type: 'error',
                data: 'The validator encountered an error and could not complete',
              }));
            },
          );
        }
      });
    });

    // Send everything else to react
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, '..', '..', 'dist', 'client', 'index.html'));
    });

    return app.listen(port, callback);
  }

  static doValidation(json, version) {
    return {
      isRpdeFeed: validator.isRpdeFeed(json),
      json,
      response: validator.validate(json, this.getValidateOptions(version)),
    };
  }

  static getValidateOptions(version) {
    const cacheDir = path.join(__dirname, '../../cache');

    const options = {
      loadRemoteJson: true,
      remoteJsonCachePath: cacheDir,
      remoteJsonCacheTimeToLive: (
        process.env.REACT_APP_MODEL_REMOTE_CACHE_TTL_SECONDS
          ? parseInt(process.env.REACT_APP_MODEL_REMOTE_CACHE_TTL_SECONDS, 10)
          : 3600
      ),
      schemaOrgSpecifications: [],
      rpdeItemLimit: (
        process.env.REACT_APP_MODEL_RPDE_ITEM_LIMIT
          ? parseInt(process.env.REACT_APP_MODEL_RPDE_ITEM_LIMIT, 10)
          : 10
      ),
      version,
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
