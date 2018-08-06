import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default class ResultSort extends Component {
  handleSortChange(e, value) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (typeof (this.props.onSortChange) === 'function') {
      this.props.onSortChange(value);
    }
  }

  render() {
    if (this.props.results && this.props.results.length) {
      const { sort } = this.props;
      const sortList = [];
      const sortOptions = {
        rowCol: 'Line Number',
        severity: 'Severity',
      };

      for (const sortOption in sortOptions) {
        if (Object.prototype.hasOwnProperty.call(sortOptions, sortOption)) {
          sortList.push(
            (
              <div key={`sort-${sortOption}-radio`} className={`form-check dropdown-item ${sort === sortOption ? 'checked' : ''}`} onClick={e => this.handleSortChange(e, sortOption)}>
                <input type="radio" name="sort" className="form-check-input" id={`${sortOption}Radio`} checked={sort === sortOption} />
                <FontAwesomeIcon icon={sort === sortOption ? 'check-square' : 'square'} fixedWidth />
                <label className="form-check-label form-check-label-severity" htmlFor={`${sortOption}Radio`}>
                  {sortOptions[sortOption]}
                </label>
              </div>
            ),
          );
        }
      }

      return (
        <div className="result-sort float-left">
          <div className="dropdown">
            <button className="btn btn-secondary dropdown-toggle" type="button" id="sortMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              Sort
            </button>
            <form className="dropdown-menu p-2" aria-labelledby="sortMenuButton">
              {sortList}
            </form>
          </div>
        </div>
      );
    }
    return '';
  }
}
