import React, { Component } from 'react';

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

  render() {
    if (this.props.results) {
      const resultList = this.props.results.map(
        (result, index) => {
          const fieldName = this.constructor.fieldName(result.path);
          return (
            <li key={index} className={result.severity} onClick={() => this.handleClick(result.path)}>
              <span className="result-title">{result.severity}</span>
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
        },
      );
      return (
        <ul className="result-list">{resultList}</ul>
      );
    }
    return '';
  }
}
