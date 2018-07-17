import React, { Component } from "react";
import brace from 'brace';
import AceEditor from 'react-ace';
import Results from './Results';

import 'brace/mode/json';
import 'brace/theme/github';
import beautify from 'json-beautify';

import "../scss/app.scss";

export default class App extends Component {
    constructor(props) {
        super(props);
        let savedJson = sessionStorage.getItem('json');
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
        let jsonString = this.getEditorValue();
        if (this.isJSONValid(jsonString)) {
            let state = Object.assign(
                {},
                this.state,
                {
                    json: this.beautifyString(jsonString)
                }
            );
            this.setState(state);
        } else {
            let state = Object.assign({}, this.state, {json: jsonString, validJSON: false});
            this.setState(state);
        }
    }

    beautifyString(jsonString) {
        return beautify(
            JSON.parse(jsonString),
            null,
            2,
            80
        );
    }

    isJSONValid(jsonString) {
        let jsonObj;
        try {
            jsonObj = JSON.parse(jsonString);
        } catch(e) {
            // Invalid JSON!
            return false;
        }
        return true;
    }

    buildJsonPath(currentPath, param, arrayPointers) {
        let stepThrough = currentPath.concat(param ? [param] : []);
        let firstPath = this.arrayToJsonPath(stepThrough);
        while (stepThrough.length > 0) {
            if (typeof(arrayPointers[this.arrayToJsonPath(stepThrough)]) !== 'undefined') {
                firstPath = firstPath.replace(
                    this.arrayToJsonPath(stepThrough),
                    this.arrayToJsonPath(stepThrough) + '[' + arrayPointers[this.arrayToJsonPath(stepThrough)] + ']'
                );
            }
            stepThrough.pop();
        }
        return firstPath;
    }

    arrayToJsonPath(array) {
        return array.join('.').replace(/\.[\.]+/g, '.').replace(/^\./, '');
    }

    onResultClick(path) {
        this.tokenMap = this.getTokenMap();
        let pathArr = path.split('.');
        while (pathArr.length) {
            let rowCol = this.tokenMap[pathArr.join('.')];
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
        let rowLength = this.refs.jsonInput.editor.getSession().getDocument().getLength();
        let currentPath = [];
        let typePath = [];
        let currentPathString = '';
        let lastParam = '$';
        let arrayPointers = {};
        let tokenMap = {};
        for (let row = 0; row < rowLength; row += 1) {
            let tokens = this.refs.jsonInput.editor.getSession().getTokens(row);
            let col = 0;
            for (let token of tokens) {
                switch (token.type) {
                case "paren.lparen":
                    if (token.value === '{') {
                        if (Object.values(tokenMap).length === 0) {
                            tokenMap[this.buildJsonPath(currentPath, lastParam, arrayPointers)] = [row, col];
                        }
                        switch (typePath[typePath.length - 1]) {
                        case "array":
                            tokenMap[this.buildJsonPath(currentPath, lastParam, arrayPointers)] = [row, col];
                            break;
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
                        arrayPointers[this.arrayToJsonPath(currentPath)] = 0;
                    }
                    break;
                case "variable":
                    lastParam = token.value.replace(/^["']/, '').replace(/["']$/, '');
                    tokenMap[this.buildJsonPath(currentPath, lastParam, arrayPointers)] = [row, col];
                    break;
                case "string":
                case "constant.numeric":
                    switch (typePath[typePath.length - 1]) {
                    case "array":
                        tokenMap[this.buildJsonPath(currentPath, lastParam, arrayPointers)] = [row, col];
                        break;
                    }
                    typePath.push(token.type);
                    break;
                case "text":
                    if (token.value.trim() === ',') {
                        switch (typePath[typePath.length - 1]) {
                        case "string":
                        case "constant.numeric":
                            typePath.pop();
                            if (typePath[typePath.length - 1] === 'array') {
                                arrayPointers[this.arrayToJsonPath(currentPath)] += 1;
                            }
                            break;
                        }
                    }
                    break;
                case "paren.rparen":
                    if (token.value === '}'
                        || token.value === ']'
                    ) {
                        switch (typePath[typePath.length - 1]) {
                        case "string":
                        case "constant.numeric":
                            typePath.pop();
                            break;
                        }
                        if (token.value === ']' && typePath[typePath.length - 1] === 'array') {
                            delete arrayPointers[this.arrayToJsonPath(currentPath)];
                        }
                        typePath.pop();
                        currentPath.pop();
                        lastParam = null;
                        if (token.value === '}' && typePath[typePath.length - 1] === 'array') {
                            arrayPointers[this.arrayToJsonPath(currentPath)] += 1;
                        }

                    }
                    break;
                }
                col += token.value.length;
            }
        }
        console.log(tokenMap);
        return tokenMap;
    }

    validate() {
        // Is JSON valid?
        let jsonString = this.getEditorValue();
        let isValid = this.isJSONValid(jsonString);

        if (!isValid) {
            let state = Object.assign({}, this.state, {validJSON: isValid, json: jsonString});
            this.setState(state);
            sessionStorage.setItem('json', jsonString);
            return;
        }

        // Beautify it
        jsonString = this.beautifyString(jsonString);

        // Send JSON to validator
        fetch('/api/validate', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: jsonString
        }).then(
            res => res.json()
        ).then(
            results => {
                this.getTokenMap();
                sessionStorage.setItem('json', jsonString);
                this.setState({ results: results, json: jsonString, validJSON: isValid})
            }
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
                          editorProps={{$blockScrolling: true}}
                        />
                    </div>
                    <div className="col-6 results-col">
                        <button className="btn btn-primary float-right" onClick={() => this.validate()}>Validate</button>
                        <Results results={this.state.results} onResultClick={(path) => this.onResultClick(path)}/>
                    </div>
                </div>
            </div>
        );
    }
}
