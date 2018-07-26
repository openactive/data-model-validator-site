import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Pluralize from 'react-pluralize';

export default class Results extends Component {
  static fieldName(path) {
    const elements = path.split('.');
    return elements[elements.length - 1];
  }

  handleClick(path) {
    if (typeof (this.props.onResultClick) === 'function') {
      this.props.onResultClick(path);
    }
  }

  handleResetFilters() {
    if (typeof (this.props.onResetFilters) === 'function') {
      this.props.onResetFilters();
    }
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
    return [0, 0];
  }

  render() {
    if (this.props.results) {
      const listList = [];
      let topMessage;
      let filtered = false;

      for (const filter in this.props.filter) {
        if (Object.prototype.hasOwnProperty.call(this.props.filter, filter)) {
          for (const setting in this.props.filter[filter]) {
            if (Object.prototype.hasOwnProperty.call(this.props.filter[filter], setting)) {
              if (!this.props.filter[filter][setting]) {
                filtered = true;
                break;
              }
            }
          }
        }
      }

      if (!this.props.results.length) {
        topMessage = (
          <div className="information-row text-center hero-sub">
            <p><FontAwesomeIcon icon="check-circle" size="4x" /></p>
            <p>Great work, the validator found no issues with your data!</p>
          </div>
        );
      } else if (filtered) {
        topMessage = (
          <div class="remove-filters" onClick={() => this.handleResetFilters()}>
            <FontAwesomeIcon icon="times" />
            Clear current filters
          </div>
        );
      } else {
        topMessage = (
          <div class="result-summary">
            <Pluralize singular="message" count={this.props.results.length} /> returned from the validator
          </div>
        );
      }

      for (const severity in this.props.severities) {
        if (
          Object.prototype.hasOwnProperty.call(this.props.severities, severity)
          && this.props.filter.severity[severity]
        ) {
          const resultList = this.props.results.map(
            (result, index) => {
              if (this.props.filter.category[result.category] && result.severity === severity) {
                const fieldName = this.constructor.fieldName(result.path);
                const rowCol = this.getRowCol(result.path);
                return (
                  <li key={index} className={result.severity}>
                    <div className="row">
                      <div className="d-none d-sm-none d-md-block col-1 col-sm-2 col-md-1 col-lg-1 col-xl-1 result-icon-circle">
                        <FontAwesomeIcon icon={this.props.severities[severity].iconCircle} size="2x" />
                      </div>
                      <div className="col-xs-4 col-sm-3 col-md-4 col-lg-4 col-xl-4">
                        <span className="result-title">{this.props.severities[severity].name}</span>
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
          if (resultList.length) {
            listList.push(
              (
                <ul
                  key={`list-${severity}`}
                  className={`result-list ${severity}-list`}
                  >
                    {resultList}
                </ul>
              ),
            );
          }
        }
      }
      if (!listList.length && this.props.results.length) {
        listList.push(
          (
            <div className="information-row text-center hero-sub">
              <p>You've hidden all of the validator's messages!<br/>Try adjusting your filters to get them back.</p>
            </div>
          ),
        );
      }

      return (
        <div className="results">
          {topMessage}
          {listList}
        </div>
      );
    }
    return '';
  }
}
