import React, { Component } from 'react';
import $ from 'jquery';
import copy from 'copy-to-clipboard';

export default class ShareLink extends Component {
  constructor(props) {
    super(props);
    this.handleOpen = this.handleOpen.bind(this);
  }

  componentDidMount() {
    $(this.refs.dropdown).on('shown.bs.dropdown', this.handleOpen);
  }

  componentWillUnmount() {
    $(this.refs.dropdown).off('shown.bs.dropdown');
  }

  handleCopyClick() {
    copy(this.props.url, {
      format: 'text/plain',
      message: 'Press #{key} to copy',
    });
    document.body.click();
  }

  handleOpen() {
    if (this.refs.url) this.refs.url.focus();
  }

  handleSubmit(e) {
    if (e) {
      e.preventDefault();
    }
    this.handleCopyClick();
  }

  render() {
    let dropdown;
    if (this.props.url !== '') {
      dropdown = <div className="input-group">
            <input type="text" ref="url" className="form-control" value={this.props.url} placeholder="" aria-label="Shareable URL" readonly />
            <div className="input-group-append">
              <button className="btn btn-primary--ghost" onClick={() => this.handleCopyClick()} type="button">Copy Link</button>
            </div>
          </div>;
    } else {
      dropdown = <pre>Please validate the JSON to create a shareable URL.</pre>;
    }

    return (
      <div className="url-loader float-left">
        <div className="dropdown" ref="dropdown">
          <button className="btn btn-primary dropdown-toggle" type="button" id="shareMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            Share
          </button>
          <form ref="form" className="dropdown-menu p-3" aria-labelledby="shareMenuButton" onSubmit={e => this.handleSubmit(e)}>
            {dropdown}
          </form>
        </div>
      </div>
    );
  }
}
