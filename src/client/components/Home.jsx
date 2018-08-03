import React, { Component } from 'react';
import AceEditor from 'react-ace';

import 'brace/mode/json';
import 'brace/theme/github';
import queryString from 'query-string';

import AceHelper from '../helpers/ace-helper';
import ApiHelper from '../helpers/api-helper';
import JsonHelper from '../helpers/json-helper';

import HelpText from './HelpText.jsx';
import LoadingOverlay from './LoadingOverlay.jsx';
import Results from './Results.jsx';
import ResultFilters from './ResultFilters.jsx';

export default class Home extends Component {
  constructor(props) {
    super(props);
    const savedJson = sessionStorage.getItem('json');
    this.severities = {
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
      notice: {
        name: 'Notice',
        icon: 'info',
        iconCircle: 'info-circle',
      },
      suggestion: {
        name: 'Tip',
        icon: 'check',
        iconCircle: 'check-circle',
      },
    };
    this.categories = {
      conformance: {
        name: 'Conformance',
      },
      'data-quality': {
        name: 'Data Quality',
      },
      internal: {
        name: 'General',
      },
    };
    this.state = {
      results: null,
      json: savedJson || '',
      validJSON: false,
      hasSubmitted: false,
      isLoading: false,
      tokenMap: {},
      filter: this.buildFilter(),
    };
    this.params = queryString.parse(this.props.location.search);
    this.processUrl();
  }

  processUrl() {
    if (typeof this.params.url !== 'undefined') {
      this.state.isLoading = true;
      ApiHelper.validateURL(this.params.url).then(
        (response) => {
          const validJSON = (typeof response.json === 'object') && response.json !== null;
          let jsonString = '';
          if (validJSON) {
            jsonString = JsonHelper.beautifyString(JSON.stringify(response.json));
          }
          sessionStorage.setItem('json', jsonString);
          this.setState({
            results: response.response,
            json: jsonString,
            isLoading: false,
            hasSubmitted: true,
            validJSON,
          }, () => {
            this.setState({
              tokenMap: this.getTokenMap(),
            });
          });
        },
      );
    }
  }

  buildFilter() {
    const severityFilter = {};
    const categoryFilter = {};
    for (const severity in this.severities) {
      if (Object.prototype.hasOwnProperty.call(this.severities, severity)) {
        severityFilter[severity] = true;
      }
    }
    for (const category in this.categories) {
      if (Object.prototype.hasOwnProperty.call(this.categories, category)) {
        categoryFilter[category] = true;
      }
    }

    return {
      severity: severityFilter,
      category: categoryFilter,
    };
  }

  resetFilter() {
    this.setState({ filter: this.buildFilter() });
  }

  toggleFilter(type, value) {
    const { filter } = this.state;
    filter[type][value] = !filter[type][value];
    this.setState({ filter });
  }

  getEditorSession() {
    return this.refs.jsonInput.editor.getSession();
  }

  getEditorValue() {
    return this.getEditorSession().getValue();
  }

  componentDidMount() {
    this.refs.jsonInput.editor.renderer.setScrollMargin(10, 10);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (
      this.state.json === nextState.json
      && JSON.stringify(this.state.results) === JSON.stringify(nextState.results)
      && this.state.isLoading === nextState.isLoading
      && this.state.hasSubmitted === nextState.hasSubmitted
      && this.state.validJSON === nextState.validJSON
      && JSON.stringify(this.state.tokenMap) !== JSON.stringify(nextState.tokenMap)
      && JSON.stringify(this.state.filter) !== JSON.stringify(nextState.filter)
    ) {
      return false;
    }
    return true;
  }

  onEditorChange(newValue) {
    sessionStorage.setItem('json', newValue);
    this.setState({
      json: newValue,
      tokenMap: this.getTokenMap(),
      validJSON: JsonHelper.isJSONValid(newValue),
    });
  }

  beautify() {
    const jsonString = this.getEditorValue();
    if (JsonHelper.isJSONValid(jsonString)) {
      this.setState({
        json: JsonHelper.beautifyString(jsonString),
        tokenMap: this.getTokenMap(),
      });
    } else {
      this.setState({ json: jsonString, validJSON: false });
    }
  }

  onResultClick(path) {
    const rowCol = AceHelper.getRowCol(path, this.state.tokenMap);
    this.refs.jsonInput.editor.selection.toSingleRange();
    this.refs.jsonInput.editor.selection.clearSelection();
    this.refs.jsonInput.editor.moveCursorTo(rowCol[0], rowCol[1]);
    this.refs.jsonInput.editor.scrollToRow(rowCol[0]);
  }

  onResetClick() {
    this.setState({
      results: null,
      json: '',
      validJSON: false,
      hasSubmitted: false,
    });
    sessionStorage.removeItem('json');
  }

  getTokenMap() {
    return AceHelper.getTokenMap(
      this.refs.jsonInput.editor.getSession(),
    );
  }

  validate() {
    // Is JSON valid?
    let jsonString = this.getEditorValue();
    const isValid = JsonHelper.isJSONValid(jsonString);

    if (!isValid) {
      const results = [{
        category: 'data-quality',
        severity: 'failure',
        path: '$',
        message: 'The JSON you\'ve entered isn\'t valid.',
      }];
      this.setState({
        results,
        validJSON: isValid,
        json: jsonString,
        hasSubmitted: true,
      });
      sessionStorage.setItem('json', jsonString);
      return;
    }

    this.setState({
      isLoading: true,
    }, () => {
      // Beautify it
      if (jsonString.length < 5000) {
        jsonString = JsonHelper.beautifyString(jsonString);
      }

      // Send JSON to validator
      ApiHelper.validate(jsonString).then(
        (responseRaw) => {
          const { response } = responseRaw;
          sessionStorage.setItem('json', jsonString);
          this.setState({
            results: response,
            json: jsonString,
            validJSON: isValid,
            hasSubmitted: true,
            isLoading: false,
            tokenMap: this.getTokenMap(),
          });
        },
      );
    });
  }

  render() {
    let helpText;
    let loadingOverlay;
    if (!this.state.hasSubmitted) {
      helpText = (
        <HelpText onValidateClick={() => this.validate()} />
      );
    }
    if (this.state.isLoading) {
      loadingOverlay = (
        <LoadingOverlay />
      );
    }
    return (
      <div className="home-page h-100">
        {loadingOverlay}
        <div id="control-bar" className="fixed-top">
          <div className="row">
            <div className="col-6">
              <button className="btn btn-secondary" onClick={() => this.onResetClick()}>Reset Editor</button>
            </div>
            <div className="col-4">
              <ResultFilters filter={this.state.filter} onFilterChange={(type, value) => this.toggleFilter(type, value)} results={this.state.results} categories={this.categories} severities={this.severities} />
            </div>
            <div className="col-2">
              <button className="btn btn-primary float-right" onClick={() => this.validate()}>Validate</button>
            </div>
          </div>
        </div>
        <div className="top-level-row row h-100 no-gutters">
          <div className="col-6 editor-col">
            <AceEditor
              ref="jsonInput"
              name="jsonInput"
              mode="json"
              theme="github"
              width="100%"
              height="100%"
              onChange={(newValue) => { this.onEditorChange(newValue); }}
              value={this.state.json}
              showPrintMargin={true}
              showGutter={true}
              highlightActiveLine={true}
              fontSize="14px"
              editorProps={{ $blockScrolling: true }}
            />
          </div>
          <div className="col-6 results-col">
            {helpText}
            <Results results={this.state.results} filter={this.state.filter} severities={this.severities} tokenMap={this.state.tokenMap} onResultClick={path => this.onResultClick(path)} onResetFilters={() => this.resetFilter()}/>
          </div>
        </div>
      </div>
    );
  }
}
