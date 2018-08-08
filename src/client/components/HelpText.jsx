import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import consts from '../data/consts';

export default class HelpText extends Component {
  handleClick() {
    if (typeof (this.props.onValidateClick) === 'function') {
      this.props.onValidateClick();
    }
  }

  render() {
    return (
      <div className="information-row text-center hero-sub">
        <p>
          This tool allows you to validate your data models against the <a href={consts.MODELLING_SPECIFICATION_URL} target="_blank" rel="noopener">Modelling Opportunity Data Specification v{this.props.version} <FontAwesomeIcon icon="external-link-alt" /></a>.
        </p>
        <p>
          Enter some JSON into the editor on the left and hit <button className="btn btn-primary button-inline" onClick={() => this.handleClick()}>Validate</button> to get started!
        </p>
      </div>
    );
  }
}
