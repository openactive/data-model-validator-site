import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Pluralize from 'react-pluralize';

export default class Results extends Component {
  constructor(props) {
    super(props);
    this.severities = {
      failure: {
        name: 'Error',
        icon: 'times',
      },
      warning: {
        name: 'Warning',
        icon: 'exclamation',
      },
      notice: {
        name: 'Notice',
        icon: 'info',
      },
      suggestion: {
        name: 'Tip',
        icon: 'check',
      },
    };
    const show = {};
    for (const severity in this.severities) {
      if (Object.prototype.hasOwnProperty.call(this.severities, severity)) {
        show[severity] = true;
      }
    }
    this.state = { show };
  }

  static fieldName(path) {
    const elements = path.split('.');
    return elements[elements.length - 1];
  }

  handleClick(path) {
    if (typeof (this.props.onResultClick) === 'function') {
      this.props.onResultClick(path);
    }
  }

  toggleSeverity(severity) {
    const stateShow = Object.assign(
      {},
      this.state.show,
      {
        [severity]: !this.state.show[severity],
      },
    );
    this.setState({ show: stateShow });
  }

  render() {
    if (this.props.results) {
      const resultList = {};
      const counts = {};
      const buttonList = [];
      const listList = [];

      for (const severity in this.severities) {
        if (Object.prototype.hasOwnProperty.call(this.severities, severity)) {
          counts[severity] = 0;
          resultList[severity] = this.props.results.map(
            (result, index) => {
              const fieldName = this.constructor.fieldName(result.path);
              if (result.severity === severity) {
                counts[severity] += 1;
                return (
                  <li key={index} className={result.severity} onClick={() => this.handleClick(result.path)}>
                    <span className="result-title">{this.severities[severity].name}</span>
                    <div className="row">
                      <div className="col-4">
                        <span title={result.path} className="result-field">{fieldName}</span>
                      </div>
                      <div className="col-8">
                        <span className="result-message">{result.message}</span>
                      </div>
                    </div>
                  </li>
                );
              }
              return null;
            },
          );
          buttonList.push(
            (
              <button
                key={`btn-${severity}`}
                type="button"
                className={`btn button-primary--alt ${(this.state.show[severity] ? 'active' : '')}`}
                disabled={counts[severity] === 0}
                onClick={() => this.toggleSeverity(severity)}
                >
                <FontAwesomeIcon fixedWidth={true} icon={this.severities[severity].icon} />
                <Pluralize singular={this.severities[severity].name} count={counts[severity]} />
              </button>
            ),
          );
          if (this.state.show[severity]) {
            listList.push(
              (
                <ul
                  key={`list-${severity}`}
                  className={`result-list ${severity}-list`}
                  >
                    {resultList[severity]}
                </ul>
              ),
            );
          }
        }
      }

      return (
        <div className="results">
          <div className="btn-group">
            {buttonList}
          </div>
          {listList}
        </div>
      );
    }
    return '';
  }
}
