import React, { Component } from 'react';

export default class LoadUrl extends Component {
  constructor(props) {
    super(props);
    this.state = {
      url: this.props.url,
    };
  }

  handleUrlChange(e) {
    this.setState({ url: e.target.value });
  }

  handleUrlClick() {
    if (typeof this.props.onUrlClick === 'function') {
      this.props.onUrlClick(this.state.url);
    }
  }

  render() {
    return (
      <div className="url-loader float-left">
        <div className="dropdown">
          <button className="btn btn-primary dropdown-toggle" type="button" id="urlMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            Load URL
          </button>
          <form className="dropdown-menu p-3" aria-labelledby="urlMenuButton">
            <div className="input-group">
              <input type="text" className="form-control" value={this.state.url} onChange={e => this.handleUrlChange(e)} placeholder="URL to load" aria-label="URL to load" />
              <div className="input-group-append">
                <button className="btn btn-primary--ghost" onClick={() => this.handleUrlClick()} type="button">Open</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }
}
