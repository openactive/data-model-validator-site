import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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
    this.state = {
      url: '',
      hasValidated: false,
      validating: false,
      isError: false,
      percentage: 0,
      results: [],
      statusText: this.defaultStatusText,
    };
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
            statusText: 'An error occurred whilst trying to validate your feed',
          });
        }
      }
    };
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
      this.ws.send(this.state.url);
    });
  }

  render() {
    const resultList = [];
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
                      <span className="result-message">{item.data.message}</span>
                    </div>
                  </div>
                </li>,
              );
              index += 1;
            }
            resultList.push(
              <div key={resultIndex} className="error-result">
                <a className="error-path" href={page.url}>{page.url}</a>
                <ul className="result-list">
                  {errorList}
                </ul>
              </div>,
            );
            resultIndex += 1;
          }
        }
      } else if (this.state.hasValidated) {
        resultList.push(
          <div key={0} className="information-row text-center hero-sub validated">
            <p><FontAwesomeIcon icon="check-circle" size="4x" /></p>
            <p>Great work, the validator found no issues with your data!</p>
          </div>,
        );
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
                {this.state.statusText}
              </div>
            </form>
          </div>
        </div>
        <div className="container">
          <div className="row">
            <div className="col">
              {resultList}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
