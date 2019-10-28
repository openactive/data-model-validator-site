import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import VersionHelper from '../helpers/version-helper';

export default class ValidationMode extends Component {
  handleValidationModeClick(e, validationMode) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (typeof this.props.onValidationModeClick === 'function') {
      this.props.onValidationModeClick(validationMode);
    }
  }

  render() {
    const meta = VersionHelper.getVersionMetaData(this.props.version);
    const { validationModeGroups } = meta;

    let selectedValidationMode;

    const modeGroups = [];
    validationModeGroups.forEach((group, groupIndex) => {
      const modeList = [];
      for (const validationModeObj of group.validationModeList) {
        const isChecked = (this.props.validationMode === validationModeObj.validationMode);
        if (isChecked) {
          selectedValidationMode = validationModeObj.name;
        }
        modeList.push(
          (
            <div key={`validation-mode-${validationModeObj.validationMode}-radio`} className={`form-check dropdown-item ${isChecked ? 'checked' : ''}`} onClick={e => this.handleValidationModeClick(e, validationModeObj.validationMode)}>
              <input type="radio" name="sort" className="form-check-input" id={`validation-mode-${validationModeObj.validationMode}Radio`} checked={isChecked} />
              <FontAwesomeIcon icon={isChecked ? 'check-square' : 'square'} fixedWidth />
              <label className="form-check-label form-check-label-version" htmlFor={`validation-mode-${validationModeObj.validationMode}Radio`}>
                {validationModeObj.name}
              </label>
            </div>
          ),
        );
      }
      modeGroups.push(
        (
          <div className="validation-mode-group" key={`validation-mode-group-${groupIndex}`}>
            <h6 className="dropdown-header">{group.name}</h6>
            {modeList}
          </div>
        ),
      );
    });

    return (
      <div className="validation-mode-switcher float-right">
        <div className="dropdown">
          <button className="btn btn-primary dropdown-toggle" type="button" id="validationModeMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              {selectedValidationMode}
          </button>
          <form className="dropdown-menu p-3" aria-labelledby="validationModeMenuButton">
            {modeGroups}
          </form>
        </div>
      </div>
    );
  }
}
