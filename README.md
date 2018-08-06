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
$ npm run dev
```

### Testing

#### Local

This project uses [Jasmine](https://jasmine.github.io/) for its tests. All spec files are located alongside the files that they target. The test run will also include a run of [eslint](https://eslint.org/).

To run tests locally, run:

```shell
$ npm test
```

#### BrowserStack

We also make use of BrowserStack for cross-platform testing, ensuring a consistent experience across the latest browsers.

[![BrowserStack](./spec/browserstack-logo-600x315.png)](https://www.browserstack.com/)
