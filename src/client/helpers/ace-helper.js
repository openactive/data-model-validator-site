const jp = require('jsonpath');

export default class AceHelper {
  static buildJsonPath(currentPath, param) {
    const stepThrough = currentPath.concat(param ? [param] : []);
    if (!stepThrough.length) {
      return '';
    }
    return jp.stringify(stepThrough);
  }

  static fieldName(path) {
    let pathArr;
    try {
      pathArr = jp.parse(path);
    } catch (e) {
      return '$';
    }
    let response = pathArr[pathArr.length - 1].expression.value;
    if (response instanceof Array) {
      response = response.map(x => x.expression.value).join(', ');
    }
    if (typeof response !== 'string') {
      return '$';
    }
    return response;
  }

  static getRowCol(path, tokenMap) {
    if (typeof tokenMap !== 'undefined') {
      let pathArr;
      try {
        pathArr = jp.parse(path);
      } catch (e) {
        return [0, 0];
      }
      const mappedArr = pathArr.map(x => x.expression.value);
      while (mappedArr.length) {
        const rowCol = tokenMap[jp.stringify(mappedArr)];
        if (rowCol) {
          return rowCol;
        }
        mappedArr.pop();
      }
    }
    return [0, 0];
  }

  static getTokenMap(session) {
    const rowLength = session.getDocument().getLength();
    const currentPath = [];
    const typePath = [];
    const tokenMap = {};
    let lastIndex;
    let lastParam = '$';
    let lastTokenWasScalar = false;
    for (let row = 0; row < rowLength; row += 1) {
      const tokens = session.getTokens(row);
      let col = 0;
      for (const token of tokens) {
        switch (token.type) {
          case 'paren.lparen':
            if (token.value === '{') {
              if (Object.values(tokenMap).length === 0
                || typePath[typePath.length - 1] === 'array'
              ) {
                tokenMap[this.buildJsonPath(currentPath, lastParam)] = [row, col];
              }
              typePath.push('object');
              if (lastParam !== null) {
                currentPath.push(lastParam);
                lastParam = null;
              }
            } else if (token.value === '[') {
              if (Object.values(tokenMap).length === 0) {
                tokenMap[this.buildJsonPath(currentPath, lastParam)] = [row, col];
              }
              typePath.push('array');
              if (lastParam !== null) {
                currentPath.push(lastParam);
                lastParam = null;
              }
              currentPath.push(0);
            }
            lastTokenWasScalar = false
            break;
          case 'variable':
            lastParam = token.value.replace(/^["']/, '').replace(/["']$/, '');
            tokenMap[this.buildJsonPath(currentPath, lastParam)] = [row, col];
            lastTokenWasScalar = false
            break;
          case 'string':
          case 'constant.numeric':
          case 'constant.language.boolean':
          case 'constant.language.escape':
            if (!lastTokenWasScalar) {
              if (typePath[typePath.length - 1] === 'array') {
                tokenMap[this.buildJsonPath(currentPath, lastParam)] = [row, col];
                lastIndex = currentPath[currentPath.length - 1];
                currentPath.pop();
              } else {
                lastIndex = null;
              }
            }
            lastTokenWasScalar = true;
            break;
          case 'text':
            if (token.value.trim() === ',') {
              if (typePath[typePath.length - 1] === 'array') {
                currentPath.push(lastIndex + 1);
              }
            }
            lastTokenWasScalar = false;
            break;
          case 'paren.rparen':
            if (token.value === '}'
                || token.value === ']'
            ) {
              // Check for empty arrays
              if (typePath[typePath.length - 1] === 'array' && currentPath[currentPath.length - 1] === 0) {
                currentPath.pop();
              }
              typePath.pop();
              if (typePath[typePath.length - 1] === 'array') {
                lastIndex = currentPath[currentPath.length - 1];
              } else {
                lastIndex = null;
              }
              currentPath.pop();
              lastParam = null;
            }
            lastTokenWasScalar = false;
            break;
          default:
            lastTokenWasScalar = false;
            break;
        }
        col += token.value.length;
      }
    }
    return tokenMap;
  }
}
