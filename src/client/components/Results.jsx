import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Pluralize from 'react-pluralize';
import jp from 'jsonpath';
import AceHelper from '../helpers/ace-helper';

export default class Results extends Component {
  static fieldName(path) {
    let pathArr;
    try {
      pathArr = jp.parse(path);
    } catch (e) {
      return '$';
    }
    let response = pathArr[pathArr.length - 1].expression.value;
    if (response instanceof Array) {
      response = response.map(x => x.expression.value).join(', ');
    }
    if (typeof response !== 'string') {
      return '$';
    }
    return response;
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
    return AceHelper.getRowCol(path, this.props.tokenMap);
  }

  render() {
    if (this.props.results) {
      const listList = [];
      let topMessage;
      let filtered = false;
      const localFilter = this.props.filter || {};

      for (const filter in localFilter) {
        if (Object.prototype.hasOwnProperty.call(localFilter, filter)) {
          for (const setting in localFilter[filter]) {
            if (Object.prototype.hasOwnProperty.call(localFilter[filter], setting)) {
              if (!localFilter[filter][setting]) {
                filtered = true;
                break;
              }
            }
          }
        }
      }

      if (typeof localFilter.severity === 'undefined') {
        localFilter.severity = {};
      }
      if (typeof localFilter.category === 'undefined') {
        localFilter.category = {};
      }

      for (const result of this.props.results) {
        if (typeof localFilter.severity[result.severity] === 'undefined') {
          localFilter.severity[result.severity] = true;
        }
        if (typeof localFilter.category[result.category] === 'undefined') {
          localFilter.category[result.category] = true;
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
          <div className="remove-filters" onClick={() => this.handleResetFilters()}>
            <FontAwesomeIcon icon="times" />
            Clear current filters
          </div>
        );
      } else {
        topMessage = (
          <div className="result-summary">
            <Pluralize singular="message" count={this.props.results.length} /> returned from the validator
          </div>
        );
      }

      for (const severity in this.props.severities) {
        if (
          Object.prototype.hasOwnProperty.call(this.props.severities, severity)
          && localFilter.severity[severity]
        ) {
          const resultList = this.props.results.map(
            (result, index) => {
              if (
                localFilter.category[result.category]
                && result.severity === severity
              ) {
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
            <div key="list-empty-information" className="list-empty-information information-row text-center hero-sub">
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
