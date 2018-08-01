import React, { Component } from 'react';
import { defaultRules } from 'openactive-data-model-validator';

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
    const rulesList = [];
    for (let index = 0; index < defaultRules.length; index += 1) {
      const rule = new defaultRules[index]();
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
            <p>This validator allows you to validate a JSON document against the <a href={consts.MODELLING_SPECIFICATION_URL}>Modelling Opportunity Specification v{consts.MODELLING_SPECIFICATION_VERSION}</a>.</p>
          </div>
        </div>
        <div className="container">
          <div className="row">
            <div className="col">
              <h4>Limitations</h4>
              <p>This validator will currently <strong>NOT:</strong></p>
              <ul>
                <li>Validate RPDE feeds</li>
                <li>Automatically fix bad data</li>
                <li>Validate custom properties</li>
                <li>Validate properties in schema.org that are not in the <a href={consts.MODELLING_SPECIFICATION_URL}>Modelling Opportunity Specification v{consts.MODELLING_SPECIFICATION_VERSION}</a>.</li>
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
