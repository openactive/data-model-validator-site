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

import '../scss/app.scss';

export default class Editor extends Component {
  constructor(props) {
    super(props);
    const savedJson = sessionStorage.getItem('json');
    this.state = {
      results: null,
      json: savedJson || '',
      validJSON: false,
      hasSubmitted: false,
      isLoading: false,
      tokenMap: {},
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
      && this.state.resulse === nextState.results
      && this.state.isLoading === nextState.isLoading
      && this.state.hasSubmitted === nextState.hasSubmitted
      && this.state.validJSON === nextState.validJSON
      && JSON.serialize(this.state.tokenMap) !== JSON.serialize(nextState.tokenMap)
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
      });
    } else {
      this.setState({ json: jsonString, validJSON: false });
    }
  }

  onResultClick(path) {
    const pathArr = path.split('.');
    while (pathArr.length) {
      const rowCol = this.state.tokenMap[pathArr.join('.')];
      if (rowCol) {
        this.refs.jsonInput.editor.selection.toSingleRange();
        this.refs.jsonInput.editor.selection.clearSelection();
        this.refs.jsonInput.editor.moveCursorTo(rowCol[0], rowCol[1]);
        return;
      }
      pathArr.pop();
    }
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
      jsonString = JsonHelper.beautifyString(jsonString);

      // Send JSON to validator
      ApiHelper.validate(jsonString).then(
        (results) => {
          sessionStorage.setItem('json', jsonString);
          this.setState({
            results,
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
      <div className="h-100">
        {loadingOverlay}
        <div id="control-bar" className="fixed-top">
          <div className="row">
            <div className="col-6">
              <button className="btn btn-secondary" onClick={() => this.onResetClick()}>Reset Editor</button>
            </div>
            <div className="col-6">
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
            <Results results={this.state.results} onResultClick={path => this.onResultClick(path)}/>
          </div>
        </div>
      </div>
    );
  }
}
