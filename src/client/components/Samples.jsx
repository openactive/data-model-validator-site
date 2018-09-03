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
    const sampleList = [];
    let key = 0;
    for (const example of examples) {
      let url = '';
      if (example.file.match(/^https?:\/\//)) {
        url = example.file;
      } else {
        url = `https://www.openactive.io/data-models/versions/${version}/examples/${example.file}`;
      }
      sampleList.push(
        (
          <Link key={key} className="dropdown-item" to={`/?url=${encodeURIComponent(url)}&version=${this.props.version}`}>
            {example.name}
          </Link>
        ),
      );
      key += 1;
    }
    return (
      <div className="sample-switcher float-left">
        <div className="dropdown">
          <button className="btn btn-primary dropdown-toggle" type="button" id="samplesMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            Samples
          </button>
          <form className="dropdown-menu" aria-labelledby="samplesMenuButton">
            {sampleList}
          </form>
        </div>
      </div>
    );
  }
}
