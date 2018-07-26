import beautify from 'json-beautify';

export default class JsonHelper {
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

  static isJSONValidObject(jsonString) {
    let jsonObj;
    try {
      jsonObj = JSON.parse(jsonString);
    } catch (e) {
      // Invalid JSON!
      return false;
    }
    if (typeof (jsonObj) !== 'object' || jsonObj === null) {
      return false;
    }
    return true;
  }
}
