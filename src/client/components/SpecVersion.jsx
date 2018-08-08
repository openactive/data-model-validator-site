import React, { Component } from 'react';
import semver from 'semver';
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
    const distilledVersions = {};
    const versionArray = [];
    const versionList = [];
    const versions = VersionHelper.getVersions();

    for (const version in versions) {
      if (Object.prototype.hasOwnProperty.call(versions, version)) {
        const resolvedVersion = versions[version];
        if (semver.valid(semver.coerce(resolvedVersion))) {
          if (typeof distilledVersions[resolvedVersion] === 'undefined') {
            distilledVersions[resolvedVersion] = [];
          }
          distilledVersions[resolvedVersion].push(version);
          if (versionArray.indexOf(resolvedVersion) < 0) {
            versionArray.push(resolvedVersion);
          }
        }
      }
    }
    if (versionArray.length === 1) {
      return '';
    }
    versionArray.sort((a, b) => {
      if (semver.lt(semver.coerce(a), semver.coerce(b))) {
        return 1;
      }
      if (semver.gt(semver.coerce(a), semver.coerce(b))) {
        return -1;
      }
      return 0;
    });
    let selectedVersionLabel;
    for (const version of versionArray) {
      const isChecked = distilledVersions[version].indexOf(this.props.version) >= 0;
      if (isChecked) {
        selectedVersionLabel = version;
      }
      versionList.push(
        (
          <div key={`version-${version}-radio`} className={`form-check dropdown-item ${isChecked ? 'checked' : ''}`} onClick={e => this.handleVersionClick(e, version)}>
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
