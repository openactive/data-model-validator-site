export default class AceHelper {
  static buildJsonPath(currentPath, param, arrayPointers) {
    const stepThrough = currentPath.concat(param ? [param] : []);
    let firstPath = this.arrayToJsonPath(stepThrough);
    while (stepThrough.length > 0) {
      if (typeof (arrayPointers[this.arrayToJsonPath(stepThrough)]) !== 'undefined') {
        firstPath = firstPath.replace(
          this.arrayToJsonPath(stepThrough),
          `${this.arrayToJsonPath(stepThrough)}[${arrayPointers[this.arrayToJsonPath(stepThrough)]}]`,
        );
      }
      stepThrough.pop();
    }
    return firstPath;
  }

  static arrayToJsonPath(array) {
    return array.join('.').replace(/\.[.]+/g, '.').replace(/^\./, '');
  }

  static getTokenMap(session) {
    const rowLength = session.getDocument().getLength();
    const currentPath = [];
    const typePath = [];
    let lastParam = '$';
    const arrayPointers = {};
    const tokenMap = {};
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
              arrayPointers[this.arrayToJsonPath(currentPath)] = 0;
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
                    arrayPointers[this.arrayToJsonPath(currentPath)] += 1;
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
          default:
            break;
        }
        col += token.value.length;
      }
    }
    return tokenMap;
  }
}
