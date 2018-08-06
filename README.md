# OpenActive Data Model Validator Site

This site uses the [OpenActive Data Model Validator](https://github.com/openactive/data-model-validator) to allow developers to validate JSON models to the latest [OpenActive Modelling Opportunity Data](https://www.openactive.io/modelling-opportunity-data/) specification.

[![Build Status](https://travis-ci.org/openactive/data-model-validator-site.svg?branch=master)](https://travis-ci.org/openactive/data-model-validator-site)
[![Known Vulnerabilities](https://snyk.io/test/github/openactive/data-model-validator-site/badge.svg)](https://snyk.io/test/github/openactive/data-model-validator-site)

## Development

### Getting started

```shell
$ git clone git@github.com:openactive/data-model-validator-site.git
$ cd data-model-validator-site
$ npm install
```
### Running the local development server

```shell
$ npm run dev
```

This command makes use of [concurrently](https://www.npmjs.com/package/concurrently) to run both the [express](https://expressjs.com/) backend server alongside the [webpack development server](https://webpack.js.org/configuration/dev-server/).

It will watch source files and perform live-reloads in the browser.

### Building

To build using webpack, simply run:

```shell
$ npm run build
```

This will compile all source files and output to the `/dist` directory.

To run the production version, you can then run:

```shell
$ npm start
```

### Deploying

To deploy to heroku, use the git method as described in the [Heroku documentation](https://devcenter.heroku.com/articles/git#for-an-existing-heroku-app)

* [Install the Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli#download-and-install)
* Add the Heroku remote to your local machine:

  ```shell
  $ heroku git:remote -a data-model-validator
  ```
* Push the latest changes to the new remote:

  ```shell
  $ git push heroku
  Counting objects: 17, done.
  Delta compression using up to 8 threads.
  Compressing objects: 100% (17/17), done.
  Writing objects: 100% (17/17), 3.34 KiB | 3.34 MiB/s, done.
  Total 17 (delta 11), reused 0 (delta 0)
  remote: Compressing source files... done.
  remote: Building source:
  remote: 
  remote: -----> Node.js app detected
  remote: 
  remote: -----> Creating runtime environment
  remote:        
  remote:        NPM_CONFIG_LOGLEVEL=error
  remote:        NODE_VERBOSE=false
  remote:        NODE_ENV=production
  remote:        NODE_MODULES_CACHE=true
  <SNIP>
  remote: -----> Compressing...
  remote:        Done: 35.7M
  remote: -----> Launching...
  remote:        Released v1
  remote:        https://data-model-validator.herokuapp.com/ deployed to Heroku
  remote: 
  remote: Verifying deploy... done.
  To https://git.heroku.com/data-model-validator.git
     cdc8b03..683d803  master -> master
  ```

### Testing

#### Local

This project uses [Jasmine](https://jasmine.github.io/) for its tests. All spec files are located alongside the files that they target.

To run tests locally, run:

```shell
$ npm test
```

The test run will also include a run of [eslint](https://eslint.org/). To run the tests without these, use:

```shell
$ npm run test-no-lint
```

#### BrowserStack

We also make use of BrowserStack for cross-platform testing, ensuring a consistent experience across the latest browsers.

[![BrowserStack](./spec/browserstack-logo-600x315.png)](https://www.browserstack.com/)
