import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Pluralize from 'react-pluralize';
import Markdown from 'markdown-to-jsx';
import AceHelper from '../helpers/ace-helper';
import MarkdownHelper from '../helpers/markdown-helper';
import ResultHelper from '../helpers/result-helper';

export default class Results extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showPaths: [],
    };
  }

  handleClick(path, e) {
    if (e) {
      e.stopPropagation();
    }
    if (typeof (this.props.onResultClick) === 'function') {
      this.props.onResultClick(path);
    }
  }

  handleToggle(key, e) {
    if (e) {
      e.stopPropagation();
    }
    const showPaths = [...this.state.showPaths];
    const index = showPaths.indexOf(key);
    if (index < 0) {
      showPaths.push(key);
    } else {
      showPaths.splice(key, 1);
    }
    this.setState({ showPaths });
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
      const markdownOpts = MarkdownHelper.getOptions();
      const items = ResultHelper.groupItems(
        this.props.results,
        this.props.tokenMap,
        this.props.group,
      );

      ResultHelper.sortItems(
        items,
        this.props.sort,
      );

      let resultsElement;
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

      for (const result of items) {
        if (typeof localFilter.severity[result.data.severity] === 'undefined') {
          localFilter.severity[result.data.severity] = true;
        }
        if (typeof localFilter.category[result.data.category] === 'undefined') {
          localFilter.category[result.data.category] = true;
        }
      }

      if (!this.props.results.length) {
        topMessage = (
          <div className="information-row text-center hero-sub validated">
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
      } else if (this.props.group && items.length < this.props.results.length) {
        const counts = [];
        for (const severity in this.props.severities) {
          if (Object.prototype.hasOwnProperty.call(this.props.severities, severity)) {
            const severityObj = this.props.severities[severity];
            let count = 0;
            for (const item of items) {
              if (item.data.severity === severity) {
                count += 1;
              }
            }
            if (count > 0) {
              counts.push({
                severity: severityObj.name,
                count,
              });
            }
          }
        }
        const ofWhich = [];
        let key = 0;
        for (const count of counts) {
          ofWhich.push(
            <span key={key}>
              &nbsp;<Pluralize singular={count.severity} count={count.count} />{key < (counts.length - 1) ? ',' : ''}
            </span>,
          );
          key += 1;
        }

        topMessage = (
          <div className="result-summary">
            <Pluralize singular="distinct message" count={items.length} /> (of which:{ofWhich}) [<Pluralize singular="message" count={this.props.results.length} /> in total returned]
          </div>
        );
      } else {
        topMessage = (
          <div className="result-summary">
            <Pluralize singular="message" count={this.props.results.length} /> returned from the validator
          </div>
        );
      }

      let hasShownResult = false;
      const resultList = items.map(
        (item, index) => {
          if (
            localFilter.severity[item.data.severity]
            && localFilter.category[item.data.category]
          ) {
            let groupExtra;
            if (item.type === 'group') {
              let groupExtraList;
              let expanded;
              if (this.state.showPaths.indexOf(item.key) >= 0) {
                let subIndex = 0;
                const groupExtraListItems = [];
                for (const subPath of item.paths) {
                  groupExtraListItems.push(
                    <li key={`${index}-${subIndex}`} onClick={e => this.handleClick(subPath.path, e)} title={`${subPath.rowCol[0] + 1}:${subPath.rowCol[1]}`} className="result-line-col">
                      Line {subPath.rowCol[0] + 1}, col {subPath.rowCol[1]}
                    </li>,
                  );
                  subIndex += 1;
                  expanded = 'expanded';
                }
                groupExtraList = (
                  <ul className="more-result-line-list">
                    {groupExtraListItems}
                  </ul>
                );
              }
              groupExtra = (
                <span className={`more-result-line-col ${expanded}`}>
                  <span className="more-result-line-col-label" onClick={e => this.handleToggle(item.key, e)}>
                    + <Pluralize singular="more occurrence" count={item.paths.length} />
                  </span>
                  {groupExtraList}
                </span>
              );
            }
            hasShownResult = true;
            return (
              <li key={index} onClick={() => this.handleClick(item.data.path)} className={`${item.data.severity} result-item item-${item.type}`}>
                <div className="row">
                  <div className="d-none d-sm-none d-md-block col-1 col-sm-2 col-md-1 col-lg-1 col-xl-1 result-icon-circle">
                    <FontAwesomeIcon icon={this.props.severities[item.data.severity].iconCircle} size="2x" />
                  </div>
                  <div className="col-xs-4 col-sm-3 col-md-4 col-lg-4 col-xl-4">
                    <span className="result-title">{this.props.severities[item.data.severity].name}</span>
                    <span title={item.data.path} className="result-field">{item.data.fieldName}</span>
                    <span title={`${item.rowCol[0] + 1}:${item.rowCol[1]}`} className="result-line-col">Line {item.rowCol[0] + 1}, col {item.rowCol[1]}</span>
                    {groupExtra}
                  </div>
                  <div className="col-7">
                    <span className="result-message-title">Message</span>
                    <span className="result-message">
                      <Markdown options={markdownOpts}>{item.data.message}</Markdown>
                  </span>
                  </div>
                </div>
              </li>
            );
          }
          return '';
        },
      );

      if (hasShownResult) {
        resultsElement = (
          <ul className="result-list">
            {resultList}
          </ul>
        );
      } else if (this.props.results.length) {
        resultsElement = (
          <div className="list-empty-information information-row text-center hero-sub">
            <p>You've hidden all of the validator's messages!<br/>Try adjusting your filters to get them back.</p>
          </div>
        );
      }

      return (
        <div className="results">
          {topMessage}
          {resultsElement}
        </div>
      );
    }
    return '';
  }
}
