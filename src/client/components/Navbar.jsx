import React, { Component } from 'react';
import LogoSVG from '../images/logo.svg';

export default class Navbar extends Component {
  /* eslint-disable class-methods-use-this */
  render() {
    return (
      <nav className="navbar navbar-expand-md navbar-light fixed-top">
        <a title="Open Active Validator" aria-label="Open Active Validator" className="navbar-brand" href="/"><LogoSVG width={80} height={52}/></a>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarCollapse">
          <ul className="navbar-nav mr-auto">
            <li className="nav-item">
              <a className="nav-link" href="https://developer.openactive.io/">Developer reference</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="https://www.openactive.io/">Open your data</a>
            </li>
          </ul>
        </div>
      </nav>
    );
  }
  /* eslint-enable class-methods-use-this */
}
