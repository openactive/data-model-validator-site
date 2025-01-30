import React, { Component } from 'react';
import Markdown from 'markdown-to-jsx';
import { defaultRules as modelRules } from '@openactive/data-model-validator';
import { defaultRules as rpdeRules } from '@openactive/rpde-validator';

import VersionHelper from '../helpers/version-helper';
import MarkdownHelper from '../helpers/markdown-helper';
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
    let specUrl = consts.MODELLING_SPECIFICATION_URL;
    if (versions.length === 1) {
      version = ` v${versions[0]}`;
      const meta = VersionHelper.getVersionMetaData(versions[0]);
      ({ specUrl } = meta);
    }

    const rulesList = {};
    const modelRulesConcat = [...modelRules.raw, ...modelRules.core];
    const rpdeRulesConcat = [...rpdeRules.http, ...rpdeRules.page, ...rpdeRules.preLastPage, ...rpdeRules.lastPage];
    const ruleObj = {
      model: modelRulesConcat,
      rpde: rpdeRulesConcat,
    };
    const markdownOpts = MarkdownHelper.getOptions();
    for (const key in ruleObj) {
      if (Object.prototype.hasOwnProperty.call(ruleObj, key)) {
        const rules = ruleObj[key];
        rulesList[key] = [];
        const alreadyUsed = [];
        for (let index = 0; index < rules.length; index += 1) {
          const rule = new rules[index]();
          if (alreadyUsed.indexOf(rule.meta.name) < 0) {
            alreadyUsed.push(rule.meta.name);
            const testList = [];
            for (const testKey in rule.meta.tests) {
              if (Object.prototype.hasOwnProperty.call(rule.meta.tests, testKey)) {
                const test = rule.meta.tests[testKey];
                let { message } = test;
                if (typeof test.sampleValues !== 'undefined') {
                  for (const sampleKey in test.sampleValues) {
                    if (Object.prototype.hasOwnProperty.call(test.sampleValues, sampleKey)) {
                      message = message.replace(new RegExp(`{{${sampleKey}}}`, 'g'), test.sampleValues[sampleKey]);
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
                        <Markdown options={markdownOpts}>{message}</Markdown>
                      </blockquote>
                    </td>
                  </tr>,
                );
              }
            }
            if (testList.length > 0) {
              rulesList[key].push(
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
          }
        }
      }
    }

    return (
      <div className="about-page">
        <div className="jumbotron">
          <div className="container">
            <h1 className="display-3">OpenActive Data Validator</h1>
            <p><a href="https://www.openactive.io/">OpenActive</a> is a community-led initiative using open data to help people get active. This validator allows you to validate a JSON document against the <a href={specUrl}>Modelling Opportunity Specification{version}</a> and the <a href="https://openactive.io/open-booking-api/EditorsDraft/1.0CR3/">Open Booking API Specification v1.0 CR3</a>.</p>
          </div>
        </div>
        <div className="container">
          <div className="row">
            <div className="col">
              <h4>Limitations</h4>
              <p>This validator will currently <strong>NOT:</strong></p>
              <ul>
                <li>Automatically fix bad data</li>
                <li>Validate custom properties</li>
                <li>Validate properties in schema.org that are not in the <a href={specUrl}>Modelling Opportunity Specification{version}</a> or the <a href="https://openactive.io/open-booking-api/EditorsDraft/1.0CR3/">Open Booking API Specification v1.0 CR3</a>.</li>
              </ul>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <h4>Rules</h4>
              <p>Below you can view the rules and sample messages applied by each validator:</p>
              <ul>
                <li><a href="#modelRules">Model validation rules</a></li>
                <li><a href="#rpdeRules">RPDE feed validation rules</a></li>
              </ul>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <h4 id="modelRules">Model validation rules</h4>
              <p>The model validator applies the following rules:</p>
              {rulesList.model}
            </div>
          </div>
          <div className="row">
            <div className="col">
              <h4 id="rpdeRules">RPDE validation rules</h4>
              <p>The RPDE feed validator applies the following rules:</p>
              {rulesList.rpde}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
