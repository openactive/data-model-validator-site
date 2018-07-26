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
        iconCircle: 'times-circle',
      },
      warning: {
        name: 'Warning',
        icon: 'exclamation',
        iconCircle: 'exclamation-circle',
      },
      notice: {
        name: 'Notice',
        icon: 'info',
        iconCircle: 'info-circle',
      },
      suggestion: {
        name: 'Tip',
        icon: 'check',
        iconCircle: 'check-circle',
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

  getRowCol(path) {
    const pathArr = path.split('.');
    while (pathArr.length) {
      const rowCol = this.props.tokenMap[pathArr.join('.')];
      if (rowCol) {
        return rowCol;
      }
      pathArr.pop();
    }
    return null;
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
              if (result.severity === severity) {
                counts[severity] += 1;
                const fieldName = this.constructor.fieldName(result.path);
                const rowCol = this.getRowCol(result.path);
                return (
                  <li key={index} className={result.severity}>
                    <div className="row">
                      <div className="d-none d-sm-none d-md-block col-1 col-sm-2 col-md-1 col-lg-1 col-xl-1 result-icon-circle">
                        <FontAwesomeIcon icon={this.severities[severity].iconCircle} size="2x" />
                      </div>
                      <div className="col-xs-4 col-sm-3 col-md-4 col-lg-4 col-xl-4">
                        <span className="result-title">{this.severities[severity].name}</span>
                        <span title={result.path} className="result-field">{fieldName}</span>
                        <span onClick={() => this.handleClick(result.path)} title={`${rowCol[0] + 1}:${rowCol[1]}`} className="result-line-col">Line {rowCol[0] + 1}, col {rowCol[1]}</span>
                      </div>
                      <div className="col-7">
                        <span className="result-message-title">Message</span>
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
