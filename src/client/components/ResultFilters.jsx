import React, { Component } from 'react';
import Pluralize from 'react-pluralize';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default class ResultFilters extends Component {
  static fieldName(path) {
    const elements = path.split('.');
    return elements[elements.length - 1];
  }

  handleFilterChange(e, type, value) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (typeof (this.props.onFilterChange) === 'function') {
      this.props.onFilterChange(type, value);
    }
  }

  handleAllFilterChange(e, type, value) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (typeof (this.props.onFilterChange) === 'function') {
      this.props.onAllFilterChange(type, value);
    }
  }

  handleGroupChange(e) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (typeof (this.props.onGroupChange) === 'function') {
      this.props.onGroupChange(!this.props.group);
    }
  }

  render() {
    if (this.props.results && this.props.results.length) {
      const counts = {};
      let { filter } = this.props;

      if (typeof filter === 'undefined') {
        filter = {};
      }

      const lists = {};
      const allChecked = {};

      const filterTypes = [
        {
          prop: 'severities',
          filter: 'severity',
          pluralize: true,
        },
        {
          prop: 'categories',
          filter: 'category',
          pluralize: false,
        },
      ];

      for (const type of filterTypes) {
        lists[type.filter] = [];
        allChecked[type.filter] = true;

        if (typeof this.props[type.prop] !== 'undefined') {
          if (typeof filter[type.filter] === 'undefined') {
            filter[type.filter] = {};
          }
          for (const item in this.props[type.prop]) {
            if (Object.prototype.hasOwnProperty.call(this.props[type.prop], item)) {
              if (typeof filter[type.filter][item] === 'undefined') {
                filter[type.filter][item] = true;
              }
              if (!filter[type.filter][item]) {
                allChecked[type.filter] = false;
              }
              counts[item] = 0;
              for (const result of this.props.results) {
                if (result[type.filter] === item) {
                  counts[item] += 1;
                }
              }
              lists[type.filter].push(
                (
                  <div key={`${type.filter}-${item}-check`} className={`form-check dropdown-item ${filter[type.filter][item] ? 'checked' : ''}`} onClick={(e) => this.handleFilterChange(e, type.filter, item)}>
                    <input type="checkbox" className="form-check-input" id={`${item}Check`} checked={filter[type.filter][item]} />
                    <FontAwesomeIcon icon={filter[type.filter][item] ? 'check-square' : 'square'} fixedWidth />
                    <label className={`form-check-label form-check-label-${type.filter}`} htmlFor={`${item}Check`}>
                      {
                        type.pluralize
                          ? <Pluralize singular={this.props[type.prop][item].name} count={counts[item]} />
                          : `${counts[item]} ${this.props[type.prop][item].name}`
                      }
                    </label>
                  </div>
                ),
              );
            }
          }
          if (lists[type.filter].length > 0) {
            lists[type.filter].unshift(
              (
                <div key={`${type.filter}-all-check`} className={`form-check dropdown-item ${allChecked[type.filter] ? 'checked' : ''}`} onClick={(e) => this.handleAllFilterChange(e, type.filter, !allChecked[type.filter])}>
                  <input type="checkbox" className="form-check-input" id={`all${type.filter}Check`} checked={allChecked[type.filter]} />
                  <FontAwesomeIcon icon={allChecked[type.filter] ? 'check-square' : 'square'} fixedWidth />
                  <label className={`form-check-label form-check-label-${type.filter}`} htmlFor={`all${type.filter}Check`}>
                    Show all
                  </label>
                </div>
              ),
            );
          }
        }
      }

      if (lists.severity.length > 0 || lists.category.length > 0) {
        return (
          <div className="result-filters float-left">
            <div className="dropdown">
              <button className="btn btn-primary dropdown-toggle" type="button" id="filtersMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                Filters
              </button>
              <form className="dropdown-menu p-2" aria-labelledby="filtersMenuButton">
                <h6 key="severity-header" className="dropdown-header">Severities</h6>
                {lists.severity}
                <h6 key="category-header" className="dropdown-header">Categories</h6>
                {lists.category}
                <div className="dropdown-divider"></div>
                <div className={`form-check dropdown-item ${this.props.group ? 'checked' : ''}`} onClick={(e) => this.handleGroupChange(e)}>
                  <input type="checkbox" className="form-check-input" id="groupCheck" checked={this.props.group} />
                  <FontAwesomeIcon icon={this.props.group ? 'check-square' : 'square'} fixedWidth />
                  <label className="form-check-label form-check-label-group" htmlFor="groupCheck">
                    Group messages
                  </label>
                </div>
              </form>
            </div>
          </div>
        );
      }
    }
    return '';
  }
}
