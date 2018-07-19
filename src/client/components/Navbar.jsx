import React, { Component } from 'react';
import LogoSVG from '../images/logo.svg';

export default class Navbar extends Component {
  /* eslint-disable class-methods-use-this */
  render() {
    return (
      <nav className="navbar navbar-expand-md fixed-top">
        <a className="navbar-brand" href="#"><LogoSVG width={80} height={52}/></a>
        <div className="information-row text-center">
          <p>
            This tool allows you to validate your data models against the <a href="https://www.openactive.io/modelling-opportunity-data/" target="_blank">Modelling Opportunity Data Specification</a>.
          </p>
        </div>
      </nav>
    );
  }
  /* eslint-enable class-methods-use-this */
}
