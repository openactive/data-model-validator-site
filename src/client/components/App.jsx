import React, { Component } from 'react';
import AceEditor from 'react-ace';

import 'brace/mode/json';
import 'brace/theme/github';
import beautify from 'json-beautify';

import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faTimes,
  faTimesCircle,
  faExclamation,
  faExclamationCircle,
  faCheck,
  faCheckCircle,
} from '@fortawesome/free-solid-svg-icons';

import Results from './Results.jsx';

// This has to be a require for our unit tests to work
import '../scss/app.scss';

// times / times-circle
// exclamation / exclamation-circle
// check / check-circle

library.add(faTimes);
library.add(faTimesCircle);
library.add(faExclamation);
library.add(faExclamationCircle);
library.add(faCheck);
library.add(faCheckCircle);

export default class App extends Component {
  constructor(props) {
    super(props);
    const savedJson = sessionStorage.getItem('json');
    this.state = { results: null, json: savedJson || '', validJSON: false };
    this.tokenMap = {};
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

  beautify() {
    const jsonString = this.getEditorValue();
    if (this.constructor.isJSONValid(jsonString)) {
      const state = Object.assign(
        {},
        this.state,
        {
          json: this.constructor.beautifyString(jsonString),
        },
      );
      this.setState(state);
    } else {
      const state = Object.assign({}, this.state, { json: jsonString, validJSON: false });
      this.setState(state);
    }
  }

  static beautifyString(jsonString) {
    return beautify(
      JSON.parse(jsonString),
      null,
      2,
      80,
    );
  }

  static isJSONValid(jsonString) {
    try {
      JSON.parse(jsonString);
    } catch (e) {
      // Invalid JSON!
      return false;
    }
    return true;
  }

  buildJsonPath(currentPath, param, arrayPointers) {
    const stepThrough = currentPath.concat(param ? [param] : []);
    let firstPath = this.constructor.arrayToJsonPath(stepThrough);
    while (stepThrough.length > 0) {
      if (typeof (arrayPointers[this.constructor.arrayToJsonPath(stepThrough)]) !== 'undefined') {
        firstPath = firstPath.replace(
          this.constructor.arrayToJsonPath(stepThrough),
          `${this.constructor.arrayToJsonPath(stepThrough)}[${arrayPointers[this.constructor.arrayToJsonPath(stepThrough)]}]`,
        );
      }
      stepThrough.pop();
    }
    return firstPath;
  }

  static arrayToJsonPath(array) {
    return array.join('.').replace(/\.[.]+/g, '.').replace(/^\./, '');
  }

  onResultClick(path) {
    this.tokenMap = this.getTokenMap();
    const pathArr = path.split('.');
    while (pathArr.length) {
      const rowCol = this.tokenMap[pathArr.join('.')];
      if (rowCol) {
        this.refs.jsonInput.editor.selection.toSingleRange();
        this.refs.jsonInput.editor.selection.clearSelection();
        this.refs.jsonInput.editor.moveCursorTo(rowCol[0], rowCol[1]);
        return;
      }
      pathArr.pop();
    }
  }

  getTokenMap() {
    const rowLength = this.refs.jsonInput.editor.getSession().getDocument().getLength();
    const currentPath = [];
    const typePath = [];
    let lastParam = '$';
    const arrayPointers = {};
    const tokenMap = {};
    for (let row = 0; row < rowLength; row += 1) {
      const tokens = this.refs.jsonInput.editor.getSession().getTokens(row);
      let col = 0;
      for (const token of tokens) {
        switch (token.type) {
          case 'paren.lparen':
            if (token.value === '{') {
              if (Object.values(tokenMap).length === 0
                || typePath[typePath.length - 1] === 'array'
              ) {
                tokenMap[this.buildJsonPath(currentPath, lastParam, arrayPointers)] = [row, col];
              }
              typePath.push('object');
              currentPath.push(lastParam);
              lastParam = null;
            } else if (token.value === '[') {
              if (Object.values(tokenMap).length === 0) {
                tokenMap[this.buildJsonPath(currentPath, lastParam, arrayPointers)] = [row, col];
                currentPath.push(null);
              }
              typePath.push('array');
              currentPath.push(lastParam);
              lastParam = null;
              arrayPointers[this.constructor.arrayToJsonPath(currentPath)] = 0;
            }
            break;
          case 'variable':
            lastParam = token.value.replace(/^["']/, '').replace(/["']$/, '');
            tokenMap[this.buildJsonPath(currentPath, lastParam, arrayPointers)] = [row, col];
            break;
          case 'string':
          case 'constant.numeric':
            if (typePath[typePath.length - 1] === 'array') {
              tokenMap[this.buildJsonPath(currentPath, lastParam, arrayPointers)] = [row, col];
            }
            typePath.push(token.type);
            break;
          case 'text':
            if (token.value.trim() === ',') {
              switch (typePath[typePath.length - 1]) {
                case 'string':
                case 'constant.numeric':
                  typePath.pop();
                  if (typePath[typePath.length - 1] === 'array') {
                    arrayPointers[this.constructor.arrayToJsonPath(currentPath)] += 1;
                  }
                  break;
                default:
                  break;
              }
            }
            break;
          case 'paren.rparen':
            if (token.value === '}'
                || token.value === ']'
            ) {
              switch (typePath[typePath.length - 1]) {
                case 'string':
                case 'constant.numeric':
                  typePath.pop();
                  break;
                default:
                  break;
              }
              if (token.value === ']' && typePath[typePath.length - 1] === 'array') {
                delete arrayPointers[this.constructor.arrayToJsonPath(currentPath)];
              }
              typePath.pop();
              currentPath.pop();
              lastParam = null;
              if (token.value === '}' && typePath[typePath.length - 1] === 'array') {
                arrayPointers[this.constructor.arrayToJsonPath(currentPath)] += 1;
              }
            }
            break;
          default:
            break;
        }
        col += token.value.length;
      }
    }
    return tokenMap;
  }

  validate() {
    // Is JSON valid?
    let jsonString = this.getEditorValue();
    const isValid = this.constructor.isJSONValid(jsonString);

    if (!isValid) {
      const state = Object.assign({}, this.state, { validJSON: isValid, json: jsonString });
      this.setState(state);
      sessionStorage.setItem('json', jsonString);
      return;
    }

    // Beautify it
    jsonString = this.constructor.beautifyString(jsonString);

    // Send JSON to validator
    fetch('/api/validate', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: jsonString,
    }).then(
      res => res.json(),
    ).then(
      (results) => {
        this.getTokenMap();
        sessionStorage.setItem('json', jsonString);
        this.setState({ results, json: jsonString, validJSON: isValid });
      },
    );
  }

  render() {
    return (
      <div className="h-100">
        <div className="top-level-row row h-100 no-gutters">
          <div className="col-6 editor-col">
            <AceEditor
              ref="jsonInput"
              name="jsonInput"
              mode="json"
              theme="github"
              width="100%"
              height="100%"
              onChange={this.onChange}
              value={this.state.json}
              showPrintMargin={true}
              showGutter={true}
              highlightActiveLine={true}
              editorProps={{ $blockScrolling: true }}
            />
          </div>
          <div className="col-6 results-col">
            <button className="btn btn-primary float-right" onClick={() => this.validate()}>Validate</button>
            <Results results={this.state.results} onResultClick={path => this.onResultClick(path)}/>
          </div>
        </div>
      </div>
    );
  }
}
