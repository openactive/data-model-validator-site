import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import VersionHelper from '../helpers/version-helper';

export default class Samples extends Component {
  render() {
    const examples = VersionHelper.getVersionExamples(this.props.version);
    const version = VersionHelper.getTranslatedVersion(this.props.version);
    if (examples.length === 0) {
      return '';
    }
    const sampleGroups = [];
    examples.forEach((exampleGroup, groupIndex) => {
      const sampleList = [];

      exampleGroup.exampleList.forEach((example, exampleIndex) => {
        let exampleUrl = '';
        if (example.file.match(/^https?:\/\//)) {
          exampleUrl = example.file;
        } else {
          exampleUrl = `https://www.openactive.io/data-models/versions/${version}/examples/${example.file}`;
        }
        let linkUrl = `/?url=${encodeURIComponent(exampleUrl)}&version=${this.props.version}`;
        if (example.validationMode) {
          linkUrl += `&validationMode=${encodeURIComponent(example.validationMode)}`;
        }

        sampleList.push(
          (
            <Link key={`sample-${exampleIndex}`} className="dropdown-item" to={linkUrl}>
              {example.name}
            </Link>
          ),
        );
      });
      sampleGroups.push(
        (
          <div key={`sample-group-${groupIndex}`} className="sample-group dropdown-submenu">
            <h6 className="dropdown-header dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">{exampleGroup.name}</h6>
            <div className="dropdown-menu">
              {sampleList}
            </div>
          </div>
        ),
      );
    });

    return (
      <div className="sample-switcher float-left">
        <div className="dropdown">
          <button className="btn btn-primary dropdown-toggle" type="button" id="samplesMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            Samples
          </button>
          <form className="dropdown-menu p-2" aria-labelledby="samplesMenuButton">
            {sampleGroups}
          </form>
        </div>
      </div>
    );
  }
}
