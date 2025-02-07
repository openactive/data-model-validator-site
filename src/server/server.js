import express from 'express';
import validator from '@openactive/data-model-validator';
import { RpdeValidator } from '@openactive/rpde-validator';
import { versions } from '@openactive/data-models';
import bodyParser from 'body-parser';
import compression from 'compression';
import axios from 'axios';
import path from 'path';
import fs from 'fs';
import expressWs from 'express-ws';
import sslRedirect from 'heroku-ssl-redirect';
import { Handler } from 'htmlmetaparser';
import { Parser } from 'htmlparser2';

const CACHE_PATH = path.join(__dirname, '../../cache');

// List on port 8080
const server = class {
  static createServer(port, callback) {
    if (!fs.existsSync(CACHE_PATH)) {
      fs.mkdirSync(CACHE_PATH);
    }

    const app = express();
    expressWs(app);

    // Force SSL
    app.use(sslRedirect());

    // for parsing application/json
    app.use(bodyParser.json());

    // GZip
    app.use(compression());

    // React static files build to here
    app.use(
      express.static('dist/client', { index: 'index.html' }),
    );

    // API route to validator
    app.post('/api/validate/:version', async (req, res) => {
      const { version } = req.params;
      if (
        typeof versions[version] === 'undefined'
        && Object.values(versions).indexOf(version) < 0
      ) {
        res.status(400).json(
          {
            json: null,
            response: [{
              category: 'internal',
              severity: 'failure',
              path: '$',
              message: 'Invalid specification version specified',
            }],
          },
        );
        return;
      }

      let { validationMode } = req.body;

      const extractJSONLDfromHTML = (url, html) => {
        let jsonld = null;

        const handler = new Handler(
          (err, result) => {
            if (!err && typeof result === 'object') {
              const jsonldArray = result.jsonld;
              // Use the first JSON-LD block on the page
              if (Array.isArray(jsonldArray) && jsonldArray.length > 0) {
                [jsonld] = jsonldArray;
              }
            }
          },
          {
            url, // The HTML pages URL is used to resolve relative URLs.
          },
        );

        // Create a HTML parser with the handler.
        const parser = new Parser(handler, { decodeEntities: true });
        parser.write(html);
        parser.done();

        return jsonld;
      };

      const extractJSONFromURL = (url) => new Promise((resolve, reject) => {
        // Is this a valid URL?
        axios.get(url)
          .then((response) => {
            if (typeof response === 'undefined') {
              reject(new Error('Response undefined.'));
              return;
            }
            if (response.status !== 200) {
              reject(new Error(`Status code ${response.status} returned by the server.`));
              return;
            }
            if (response.data === null || response.data === '') {
              reject(new Error('No body was returned from the server.'));
              return;
            }
            if (typeof response.data !== 'object') {
              if (typeof response.data === 'string') {
                // First try extracting JSON-LD from the HTML (for Dataset Sites)
                const jsonld = extractJSONLDfromHTML(url, response.data);
                if (jsonld !== null) {
                  resolve({ parsedJson: jsonld, validationModeHint: 'DatasetSite' });
                }

                // Otherwise try using JSON.parse, which will return a more specific parsing error
                try {
                  resolve({ parsedJson: JSON.parse(response.data) });
                } catch (error) {
                  reject(error);
                  return;
                }
              }
              reject(new Error('JSON parsing failed.'));
              return;
            }
            resolve({ parsedJson: response.data });
          })
          .catch((error) => {
            reject(error);
          });
      });

      const extractJSONFromBody = (jsonString) => new Promise((resolve) => {
        resolve(JSON.parse(jsonString));
      });

      let parsedJson = null;
      let validationModeHint;

      if (req.body.url) {
        try {
          ({ parsedJson, validationModeHint } = await extractJSONFromURL(req.body.url));

          if (typeof validationModeHint === 'undefined') {
            switch (parsedJson['@type'] || parsedJson.type) {
              case 'Dataset':
                validationModeHint = 'DatasetSite';
                break;
              case 'DataCatalog':
                validationModeHint = 'DataCatalog';
                break;
              default:
            }
          }

          if (Array.isArray(parsedJson.items) && req.body.rpdeId !== undefined) {
            // Match string or int id
            // eslint-disable-next-line eqeqeq
            const requestedItem = parsedJson.items.find((item) => item.id == req.body.rpdeId);
            if (requestedItem !== undefined) {
              parsedJson.items = [requestedItem];
            } else {
              res.status(400).json(
                {
                  json: null,
                  response: [{
                    category: 'internal',
                    severity: 'failure',
                    path: '$',
                    message: `The RPDE item \`id\` provided (\`${req.body.rpdeId}\`) could not be found in the specified RPDE page (${req.body.url}). The item may have been updated since this validator link was generated.`,
                  }],
                },
              );
              return;
            }
          }
        } catch (e) {
          res.status(400).json(
            {
              json: null,
              response: [{
                category: 'internal',
                severity: 'failure',
                path: '$',
                message: `The url that you have provided does not contain a valid JSON document. ${e.message}`,
              }],
            },
          );
          return;
        }
      } else {
        try {
          parsedJson = await extractJSONFromBody(req.body.json);
        } catch (e) {
          res.status(400).json(
            {
              json: req.body.json,
              response: [{
                category: 'internal',
                severity: 'failure',
                path: '$',
                message: 'Invalid JSON.',
              }],
            },
          );
          return;
        }
      }

      if (typeof validationModeHint !== 'undefined') {
        validationMode = validationModeHint;
      }

      try {
        const responseBody = await this.doValidation(parsedJson, version, validationMode);
        responseBody.validationModeHint = validationModeHint;
        res.status(200).json(responseBody);
      } catch (e) {
        console.error(e);
        res.status(400).json({
          json: parsedJson,
          response: [{
            category: 'internal',
            severity: 'failure',
            path: '$',
            message: `Internal validator error: ${e.message}`,
          }],
        });
      }
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

  static async doValidation(json, version, validationMode) {
    const response = await validator.validate(json, this.getValidateOptions(version, validationMode));
    const isRpdeFeed = validator.isRpdeFeed(json);
    return {
      isRpdeFeed,
      json,
      response,
    };
  }

  static getValidateOptions(version, validationMode) {
    const options = {
      loadRemoteJson: true,
      remoteJsonCachePath: CACHE_PATH,
      remoteJsonCacheTimeToLive: (
        process.env.REACT_APP_MODEL_REMOTE_CACHE_TTL_SECONDS
          ? parseInt(process.env.REACT_APP_MODEL_REMOTE_CACHE_TTL_SECONDS, 10)
          : 3600
      ),
      rpdeItemLimit: (
        process.env.REACT_APP_MODEL_RPDE_ITEM_LIMIT
          ? parseInt(process.env.REACT_APP_MODEL_RPDE_ITEM_LIMIT, 10)
          : 10
      ),
      version,
      validationMode,
    };

    return options;
  }
};

module.exports = server;
