import React, { Component } from 'react';
import { defaultRules } from 'openactive-data-model-validator';

import VersionHelper from '../helpers/version-helper';
import consts from '../data/consts';

export default class About extends Component {
  constructor(props) {
    super(props);
    this.categories = {
      conformance: {
        name: 'Conformance',
      },
      'data-quality': {
        name: 'Data Quality',
      },
      internal: {
        name: 'General',
      },
    };
  }

  render() {
    const versions = VersionHelper.getUniqueVersions();
    let version = '';
    if (versions.length === 1) {
      version = ` v${versions[0]}`;
    }

    const rulesList = [];
    const defaultRulesConcat = [...defaultRules.raw, ...defaultRules.core];
    for (let index = 0; index < defaultRulesConcat.length; index += 1) {
      const rule = new defaultRulesConcat[index]();
      const testList = [];
      for (const testKey in rule.meta.tests) {
        if (Object.prototype.hasOwnProperty.call(rule.meta.tests, testKey)) {
          const test = rule.meta.tests[testKey];
          let { message } = test;
          if (typeof test.sampleValues !== 'undefined') {
            for (const key in test.sampleValues) {
              if (Object.prototype.hasOwnProperty.call(test.sampleValues, key)) {
                message = message.replace(new RegExp(`{{${key}}}`, 'g'), test.sampleValues[key]);
              }
            }
          }
          testList.push(
            <tr key={`tr-${rule.meta.name}-${testKey}`}>
              <td width="15%" className="table-primary">
                {this.categories[test.category].name}
              </td>
              <td width="15%" className={`td-severity td-severity-${test.severity}`}>
                {test.severity}
              </td>
              <td>
                <p>{test.description || rule.meta.description}</p>
                <h6>Example message</h6>
                <blockquote>
                  <p>{message}</p>
                </blockquote>
              </td>
            </tr>,
          );
        }
      }
      rulesList.push(
        <div key={`rule-${rule.meta.name}`} className="rule-definition">
          <h5>{rule.meta.name}</h5>
          <table className="table table-bordered" width="100%">
            <tbody>
              {testList}
            </tbody>
          </table>
        </div>,
      );
    }
    return (
      <div className="about-page">
        <div className="jumbotron">
          <div className="container">
            <h1 className="display-3">OpenActive Data Validator</h1>
            <p><a href="https://www.openactive.io/">OpenActive</a> is a community-led initiative using open data to help people get active. This validator allows you to validate a JSON document against the <a href={consts.MODELLING_SPECIFICATION_URL}>Modelling Opportunity Specification{version}</a>.</p>
          </div>
        </div>
        <div className="container">
          <div className="row">
            <div className="col">
              <h4>Limitations</h4>
              <p>This validator will currently <strong>NOT:</strong></p>
              <ul>
                <li>Fully validate RPDE feeds, although it can validate the data models within a valid feed</li>
                <li>Automatically fix bad data</li>
                <li>Validate custom properties</li>
                <li>Validate properties in schema.org that are not in the <a href={consts.MODELLING_SPECIFICATION_URL}>Modelling Opportunity Specification{version}</a>.</li>
              </ul>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <h4>Rules</h4>
              <p>The validator applies the following rules:</p>
              {rulesList}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
