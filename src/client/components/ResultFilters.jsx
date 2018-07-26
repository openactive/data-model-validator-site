import React, { Component } from 'react';
import Pluralize from 'react-pluralize';

export default class ResultFilters extends Component {
  static fieldName(path) {
    const elements = path.split('.');
    return elements[elements.length - 1];
  }

  handleFilterChange(type, value) {
    if (typeof (this.props.onFilterChange) === 'function') {
      this.props.onFilterChange(type, value);
    }
  }

  render() {
    if (this.props.results && this.props.results.length) {
      const counts = {};
      const severityList = [];
      const categoryList = [];

      for (const severity in this.props.severities) {
        if (Object.prototype.hasOwnProperty.call(this.props.severities, severity)) {
          counts[severity] = 0;
          for (const result of this.props.results) {
            if (result.severity === severity) {
              counts[severity] += 1;
            }
          }
          severityList.push(
            (
              <div class="form-check dropdown-item">
                <input type="checkbox" className="form-check-input" id={`${severity}Check`} checked={this.props.filter.severity[severity]} onChange={() => this.handleFilterChange('severity', severity)} />
                <label className="form-check-label" for={`${severity}Check`}>
                  <Pluralize singular={this.props.severities[severity].name} count={counts[severity]} />
                </label>
              </div>
            ),
          );
        }
      }

      for (const category in this.props.categories) {
        if (Object.prototype.hasOwnProperty.call(this.props.categories, category)) {
          counts[category] = 0;
          for (const result of this.props.results) {
            if (result.category === category) {
              counts[category] += 1;
            }
          }
          categoryList.push(
            (
              <div class="form-check dropdown-item">
                <input type="checkbox" className="form-check-input" id={`${category}Check`} checked={this.props.filter.category[category]} onChange={() => this.handleFilterChange('category', category)} />
                <label className="form-check-label" for={`${category}Check`}>
                  {counts[category]} {this.props.categories[category].name}
                </label>
              </div>
            ),
          );
        }
      }

      return (
        <div className="result-filters">
          <div className="dropdown">
            <button className="btn btn-secondary dropdown-toggle" type="button" id="filtersMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              Filters
            </button>
            <form className="dropdown-menu p-2" aria-labelledby="filtersMenuButton">
              <h6 class="dropdown-header">Severities</h6>
              {severityList}
              <h6 class="dropdown-header">Categories</h6>
              {categoryList}
            </form>
          </div>
        </div>
      );
    }
    return '';
  }
}
