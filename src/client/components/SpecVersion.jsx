import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import VersionHelper from '../helpers/version-helper';

export default class SpecVersion extends Component {
  handleVersionClick(e, version) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (typeof this.props.onVersionClick === 'function') {
      this.props.onVersionClick(version);
    }
  }

  render() {
    const versionList = [];
    const uniqueVersions = VersionHelper.getUniqueVersions();
    const versions = VersionHelper.getVersions();
    if (uniqueVersions.length === 1) {
      return '';
    }
    let selectedVersionLabel;
    for (const version of uniqueVersions) {
      const isChecked = (
        version === this.props.version
        || versions[version] === versions[this.props.version]
        || versions[version] === this.props.version
      );
      if (isChecked) {
        selectedVersionLabel = version;
      }
      versionList.push(
        (
          <div key={`version-${version}-radio`} className={`form-check dropdown-item ${isChecked ? 'checked' : ''}`} onClick={(e) => this.handleVersionClick(e, version)}>
            <input type="radio" name="sort" className="form-check-input" id={`version-${version}Radio`} checked={isChecked} />
            <FontAwesomeIcon icon={isChecked ? 'check-square' : 'square'} fixedWidth />
            <label className="form-check-label form-check-label-version" htmlFor={`version-${version}Radio`}>
              {version}
            </label>
          </div>
        ),
      );
    }
    return (
      <div className="version-switcher float-left">
        <div className="dropdown">
          <button className="btn btn-primary dropdown-toggle" type="button" id="versionMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            {selectedVersionLabel}
          </button>
          <form className="dropdown-menu p-3" aria-labelledby="versionMenuButton">
            {versionList}
          </form>
        </div>
      </div>
    );
  }
}
