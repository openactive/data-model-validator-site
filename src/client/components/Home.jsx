import React, { Component } from 'react';
import AceEditor from 'react-ace';

import 'brace/mode/json';
import 'brace/theme/github';
import queryString from 'query-string';
import { Base64 } from 'js-base64';

import AceHelper from '../helpers/ace-helper';
import ApiHelper from '../helpers/api-helper';
import JsonHelper from '../helpers/json-helper';
import VersionHelper from '../helpers/version-helper';

import HelpText from './HelpText.jsx';
import LoadingOverlay from './LoadingOverlay.jsx';
import Results from './Results.jsx';
import ResultFilters from './ResultFilters.jsx';
import ResultSort from './ResultSort.jsx';
import SpecVersion from './SpecVersion.jsx';
import ValidationMode from './ValidationMode.jsx';
import Samples from './Samples.jsx';
import LoadUrl from './LoadUrl.jsx';
import ShareLink from './ShareLink.jsx';

export default class Home extends Component {
  constructor(props) {
    super(props);
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
    this.params = queryString.parse(this.props.location.search);
    if (typeof this.params.json !== 'undefined') {
      // If the url contains JSON, override the last saved JSON
      sessionStorage.setItem('json', Base64.decode(this.params.json));
    }
    const savedJson = sessionStorage.getItem('json');
    const version = this.normalizeVersion();
    const validationMode = this.normalizeValidationMode(version);
    this.state = {
      results: null,
      json: savedJson || '',
      validJSON: false,
      hasSubmitted: false,
      isLoading: false,
      tokenMap: {},
      filter: this.buildFilter(),
      sort: 'severity',
      group: true,
      version,
      validationMode,
      shareUrl: '',
    };

    this.processUrl(true);
    this.props.history.listen((location) => {
      this.params = queryString.parse(location.search);
      const historyVersion = this.normalizeVersion();
      const historyValidationMode = this.normalizeValidationMode(historyVersion);
      this.setState({ version: historyVersion, validationMode: historyValidationMode }, () => this.processUrl(false));
    });

    if (typeof this.params.json !== 'undefined') {
      // If the url contains JSON, ensure the URL is clean so that it doesn't overwrite existing work
      this.cleanRedirect();
    }
  }

  normalizeVersion() {
    if (typeof this.params.version !== 'undefined') {
      return VersionHelper.getTranslatedVersion(this.params.version);
    }
    return VersionHelper.getLatestVersion();
  }

  normalizeValidationMode(version) {
    if (typeof this.params.validationMode !== 'undefined') {
      return this.params.validationMode;
    }
    return VersionHelper.getDefaultValidationMode(version);
  }

  processUrl(isFirstRun) {
    if (typeof this.params.url !== 'undefined' || typeof this.params.json !== 'undefined') {
      const doProcessUrl = () => {
        (typeof this.params.url !== 'undefined'
          ? ApiHelper.validateURL(this.params.url, this.params.rpdeId, this.state.version, this.state.validationMode)
          : ApiHelper.validateJSON(Base64.decode(this.params.json), this.state.version, this.state.validationMode))
          .then(
            (response) => {
              const validJSON = (typeof response.json === 'object') && response.json !== null;
              let jsonString = '';
              if (validJSON) {
                jsonString = JsonHelper.beautifyString(JSON.stringify(response.json));
              }
              sessionStorage.setItem('json', jsonString);
              const state = {
                results: response.response,
                json: jsonString,
                isLoading: false,
                hasSubmitted: true,
                validJSON,
              };
              if (response.validationModeHint) state.validationMode = response.validationModeHint;
              this.setState(state, () => {
                this.setState({
                  tokenMap: this.getTokenMap(),
                  shareUrl: this.getShareUrl(jsonString),
                });
              });
            },
          );
      };
      if (isFirstRun) {
        this.state.isLoading = true;
        doProcessUrl();
      } else {
        this.setState({
          isLoading: true,
        }, doProcessUrl);
      }
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
    const filter = Object.assign({}, this.state.filter);
    const typeFilter = Object.assign({}, filter[type]);
    typeFilter[value] = !typeFilter[value];
    filter[type] = typeFilter;
    this.setState({ filter });
  }

  toggleAllFilter(type, value) {
    const filter = Object.assign({}, this.state.filter);
    const typeFilter = Object.assign({}, filter[type]);
    for (const prop in typeFilter) {
      if (Object.prototype.hasOwnProperty.call(typeFilter, prop)) {
        typeFilter[prop] = value;
      }
    }
    filter[type] = typeFilter;
    this.setState({ filter });
  }

  changeSort(sort) {
    this.setState({ sort });
  }

  toggleGroup(value) {
    this.setState({ group: value });
  }

  changeVersion(version) {
    this.setState({ version });
  }

  changeValidationMode(validationMode) {
    this.setState({ validationMode }, () => this.validate());
  }

  cleanRedirect() {
    this.props.history.push({
      pathname: '/',
      search: `?version=${encodeURIComponent(this.state.version)}&validationMode=${encodeURIComponent(this.state.validationMode)}`,
    });
  }

  urlRedirect(url) {
    this.props.history.push({
      pathname: '/',
      search: `?url=${encodeURIComponent(url)}&version=${encodeURIComponent(this.state.version)}&validationMode=${encodeURIComponent(this.state.validationMode)}`,
    });
  }

  getEditorSession() {
    return this.refs.jsonInput.editor.getSession();
  }

  getEditorValue() {
    return this.getEditorSession().getValue();
  }

  componentDidMount() {
    this.refs.jsonInput.editor.renderer.setScrollMargin(10, 10);
    document.getElementsByClassName('ace_text-input')[0].setAttribute('aria-label', 'Input for ACE code editor');
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (
      this.state.json === nextState.json
      && JSON.stringify(this.state.results) === JSON.stringify(nextState.results)
      && this.state.isLoading === nextState.isLoading
      && this.state.hasSubmitted === nextState.hasSubmitted
      && this.state.validJSON === nextState.validJSON
      && JSON.stringify(this.state.tokenMap) === JSON.stringify(nextState.tokenMap)
      && this.state.shareUrl === nextState.shareUrl
      && JSON.stringify(this.state.filter) === JSON.stringify(nextState.filter)
      && this.state.sort === nextState.sort
      && this.state.group === nextState.group
      && this.state.version === nextState.version
      && this.state.validationMode === nextState.validationMode
    ) {
      return false;
    }
    return true;
  }

  onEditorChange(newValue) {
    sessionStorage.setItem('json', newValue);
    if (this.state.shareUrl !== '' && this.state.shareUrl !== this.getShareUrl(newValue)) {
      // If the Share URL was invalidated then remove it
      this.setState({ shareUrl: '' });
    }
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

  getShareUrl(jsonString) {
    return `${window.location.protocol}//${window.location.host}${window.location.pathname}?version=${encodeURIComponent(this.state.version)}&validationMode=${encodeURIComponent(this.state.validationMode)}&json=${Base64.encodeURI(jsonString)}`;
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
        message: 'The JSON you\'ve entered isn\'t valid.\n\nJSON validation errors are shown in the left-hand margin of the text editor.',
      }];
      this.setState({
        results,
        validJSON: isValid,
        json: jsonString,
        hasSubmitted: true,
        shareUrl: '',
      });
      sessionStorage.setItem('json', jsonString);
      return;
    }

    this.setState({
      isLoading: true,
    }, () => {
      // Beautify it
      if (jsonString.length < 50000) {
        jsonString = JsonHelper.beautifyString(jsonString);
      } else {
        jsonString = JsonHelper.cleanString(jsonString);
      }

      // Send JSON to validator
      ApiHelper.validateJSON(jsonString, this.state.version, this.state.validationMode).then(
        (responseRaw) => {
          const { response, validationModeHint } = responseRaw;
          sessionStorage.setItem('json', jsonString);
          const state = {
            results: response,
            json: jsonString,
            validJSON: isValid,
            hasSubmitted: true,
            isLoading: false,
          };
          if (validationModeHint) state.validationMode = validationModeHint;
          this.setState(state, () => {
            this.setState({
              tokenMap: this.getTokenMap(),
              shareUrl: this.getShareUrl(jsonString),
            });
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
        <HelpText version={this.state.version} onValidateClick={() => this.validate()} />
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
              <button className="btn btn-primary float-left" onClick={() => this.onResetClick()}>Reset</button>
              <LoadUrl url={this.params.url} onUrlClick={url => this.urlRedirect(url)} />
              <SpecVersion version={this.state.version} onVersionClick={version => this.changeVersion(version)} />
              <Samples version={this.state.version} />
              <ShareLink url={this.state.shareUrl} />
            </div>
            <div className="col-3">
              <ResultFilters filter={this.state.filter} onFilterChange={(type, value) => this.toggleFilter(type, value)} onAllFilterChange={(type, value) => this.toggleAllFilter(type, value)} onGroupChange={value => this.toggleGroup(value)} group={this.state.group} results={this.state.results} categories={this.categories} severities={this.severities} />
              <ResultSort sort={this.state.sort} onSortChange={value => this.changeSort(value)} results={this.state.results} />
            </div>
            <div className="col-3">
              <button className="btn btn-primary float-right" onClick={() => this.validate()}>Validate</button>
              <ValidationMode version={this.state.version} validationMode={this.state.validationMode} onValidationModeClick={validationMode => this.changeValidationMode(validationMode)} />
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
              tabSize={2}
              showPrintMargin={true}
              showGutter={true}
              highlightActiveLine={true}
              fontSize="14px"
              editorProps={{ $blockScrolling: true }}
            />
          </div>
          <div className="col-6 results-col">
            {helpText}
            <Results results={this.state.results} filter={this.state.filter} sort={this.state.sort} group={this.state.group} severities={this.severities} tokenMap={this.state.tokenMap} version={this.state.version} validationMode={this.state.validationMode} onResultClick={path => this.onResultClick(path)} onResetFilters={() => this.resetFilter()}/>
          </div>
        </div>
      </div>
    );
  }
}
