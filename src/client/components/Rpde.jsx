import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import queryString from 'query-string';
import Pluralize from 'react-pluralize';
import Markdown from 'markdown-to-jsx';
import MarkdownHelper from '../helpers/markdown-helper';

export default class Rpde extends Component {
  constructor(props) {
    super(props);
    this.defaultStatusText = 'Enter a feed URL above to validate it!';
    this.severities = {
      notice: {
        name: 'Notice',
        icon: 'info',
        iconCircle: 'info-circle',
      },
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
      suggestion: {
        name: 'Tip',
        icon: 'check',
        iconCircle: 'check-circle',
      },
    };
    if (typeof this.props.location === 'object') {
      this.params = queryString.parse(this.props.location.search);
    }
    let url = '';
    try {
      const urlObj = new URL(this.params.url);
      url = urlObj.href;
    } catch (e) {
      // do nothing
    }
    this.state = {
      url,
      hasValidated: false,
      validating: false,
      isError: false,
      percentage: 0,
      results: [],
      statusText: this.defaultStatusText,
    };
  }

  componentDidMount() {
    if (this.state.url !== '') {
      this.validate();
    }
  }

  initWebSocket(callback) {
    if (
      !this.ws
      || this.ws.readyState === this.ws.CLOSING
      || this.ws.readyState === this.ws.CLOSED
    ) {
      let protocol = 'ws';
      if (window.location.hostname !== 'localhost' || window.location.protocol === 'https:') {
        protocol = 'wss';
      }
      this.ws = new WebSocket(`${protocol}://${window.location.host}/ws`);
      this.ws.onmessage = (message) => {
        if (
          typeof message === 'object'
          && message.type === 'message'
        ) {
          try {
            const data = JSON.parse(message.data);
            switch (data.type) {
              case 'error':
                this.setState({
                  validating: false,
                  isError: true,
                  statusText: data.data,
                });
                break;
              case 'log':
                this.setState({
                  validating: true,
                  isError: false,
                  percentage: data.data.percentage,
                  statusText: data.data.message,
                });
                break;
              case 'results':
                this.setState({
                  validating: false,
                  hasValidated: true,
                  isError: false,
                  results: data.data.pages,
                  statusText: 'Validation complete!',
                });
                break;
              default:
                // do nothing
                break;
            }
          } catch (e) {
            console.error(e);
            this.setState({
              validating: false,
              isError: true,
              hasValidated: false,
              statusText: 'An error occurred whilst trying to validate your feed',
            });
          }
        }
      };
    }
    if (this.ws.readyState === this.ws.CONNECTING) {
      this.ws.onopen = callback;
    } else {
      callback();
    }
  }

  handleChange(event) {
    this.setState({ url: event.target.value });
  }

  handleSubmit(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.validate();
  }

  validate() {
    this.setState({
      validating: true,
      percentage: 0,
      hasValidated: false,
      isError: false,
      results: [],
      statusText: 'Started validation...',
    }, () => {
      this.initWebSocket(() => {
        this.ws.send(this.state.url);
      });
    });
  }

  render() {
    const resultList = [];
    let hasPassed = true;
    let hasFailure = false;
    let pageCount;
    let rpdeHint;
    let rpdeType;
    let { statusText } = this.state;
    let errorCount = 0;
    const markdownOpts = MarkdownHelper.getOptions();

    const rpdeHintTimestamp = (
      <div className="rpde-hint">
        <p>Misreading the query in the specification is the single most common cause of incorrect implementation. Please read it carefully and ensure that brackets and comparators are used correctly. <code>&gt;</code> not <code>&gt;=</code> for example.</p>
        <p>Please ensure that you have implemented <a href="https://openactive.io/realtime-paged-data-exchange/#sql-query-example-for-timestamp-id" target="_blank" rel="noopener">this query</a> correctly:</p>
        <code className="code-block">
          <span className="code-comment">--include WHERE clause only if @afterTimestamp and @afterId provided</span><br/>
          &nbsp;&nbsp;&nbsp;<span className="code-keyword">WHERE</span> (modified <span className="code-op">=</span> @afterTimestamp<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="code-keyword">AND</span> id <span className="code-op">&gt;</span> @afterId)<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="code-keyword">OR</span> (modified <span className="code-op">&gt;</span> @afterTimestamp)<br/>
          <span className="code-keyword">ORDER BY</span> modified,<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;id
        </code>
      </div>
    );

    const rpdeHintChangeNumber = (
      <div className="rpde-hint">
        <p>Misreading the query in the specification is the single most common cause of incorrect implementation. Please read it carefully and ensure that brackets and comparators are used correctly. <code>&gt;</code> not <code>&gt;=</code> for example.</p>
        <p>Please ensure that you have implemented <a href="https://openactive.io/realtime-paged-data-exchange/#sql-query-example-for-change-number" target="_blank" rel="noopener">this query</a> correctly:</p>
        <code className="code-block">
          <span className="code-comment">--include WHERE clause only if @afterChangeNumber provided</span>
          &nbsp;&nbsp;&nbsp;<span className="code-keyword">WHERE</span> change_number <span className="code-op">&gt;</span> @afterChangeNumber<br/>
          <span className="code-keyword">ORDER BY</span> change_number
        </code>
      </div>
    );

    if (!this.state.validating) {
      if (this.state.results.length > 0) {
        let resultIndex = 0;
        for (const page of this.state.results) {
          if (page.errors.length > 0) {
            const errorList = [];
            let index = 0;
            for (const item of page.errors) {
              errorList.push(
                <li key={index} className={`${item.data.severity} result-item item-${item.data.type}`}>
                  <div className="row">
                    <div className="d-none d-sm-none d-md-block col-1 col-sm-2 col-md-1 col-lg-1 col-xl-1 result-icon-circle">
                      <FontAwesomeIcon icon={this.severities[item.data.severity].iconCircle} size="2x" />
                    </div>
                    <div className="col">
                      <span className="result-title">{this.severities[item.data.severity].name}</span>
                      <span className="result-message"><Markdown options={markdownOpts}>{item.data.message}</Markdown></span>
                    </div>
                  </div>
                </li>,
              );
              if (item.data.severity !== 'suggestion') {
                hasPassed = false;
                if (item.data.severity === 'failure') {
                  hasFailure = true;
                }
                errorCount += 1;
              }
              index += 1;
            }
            resultList.push(
              <div key={resultIndex} className="error-result">
                <a className="error-path" href={page.url} target="_blank" rel="noopener">{page.url}</a>
                <ul className="result-list">
                  {errorList}
                </ul>
              </div>,
            );
            if (page.url.match(/afterTimestamp/)) {
              rpdeType = 'afterTimestamp';
            } else if (page.url.match(/afterChangeNumber/)) {
              rpdeType = 'afterChangeNumber';
            }
            resultIndex += 1;
          }
        }
        pageCount = (
          <p className="page-count">Validated <Pluralize singular="page" count={this.state.results.length} />.</p>
        );
      }
      if (this.state.hasValidated) {
        if (hasPassed) {
          statusText = (
            <div className="validated">
              <p><FontAwesomeIcon icon="check-circle" size="4x" /></p>
              <p>Great work, the validator found no issues with your feed!</p>
            </div>
          );
        } else {
          statusText = (
            <div className="errored">
              <p><FontAwesomeIcon icon="exclamation-circle" size="4x" /></p>
              <p>The validator found <Pluralize singular="issue" count={errorCount} /> with your feed.</p>
            </div>
          );
          if (hasFailure) {
            switch (rpdeType) {
              case 'afterTimestamp':
                rpdeHint = rpdeHintTimestamp;
                break;
              case 'afterChangeNumber':
                rpdeHint = rpdeHintChangeNumber;
                break;
              default:
                break;
            }
          }
        }
      }
    }
    return (
      <div className="rpde-page">
        <div className="jumbotron">
          {
            this.state.validating
              ? <div className="percentage" style={{ width: `${this.state.percentage}%` }}></div>
              : ''
          }
          <div className="container">
            <h1 className="display-4">RPDE Feed Validator</h1>
            <form className="form-inline" onSubmit={e => this.handleSubmit(e)}>
              <label className="sr-only" htmlFor="urlInput">Feed URL</label>
              <div className="input-group input-group-lg">
                <input type="url" className="form-control" id="urlInput" disabled={this.state.validating} placeholder="Feed URL" value={this.state.url} onChange={event => this.handleChange(event)} />
                <div className="input-group-append">
                  <button className="btn btn-primary" type="button" disabled={this.state.validating} id="validateButton" onClick={() => this.validate()}>Validate</button>
                </div>
              </div>
              <div className={`status-text ${this.state.isError ? 'error' : ''}`}>
                {statusText}
                {pageCount}
              </div>
            </form>
          </div>
        </div>
        <div className="container">
          <div className="row">
            <div className="col">
              {rpdeHint}
              {resultList}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
