import stripJsonComments from 'strip-json-comments';

export default class JsonHelper {
  static beautifyString(jsonString) {
    return JSON.stringify(
      JSON.parse(stripJsonComments(jsonString)),
      null,
      2,
    );
  }

  static cleanString(jsonString) {
    return stripJsonComments(jsonString);
  }

  static isJSONValid(jsonString) {
    try {
      JSON.parse(stripJsonComments(jsonString));
    } catch (e) {
      // Invalid JSON!
      return false;
    }
    return true;
  }

  static isJSONValidObject(jsonString) {
    let jsonObj;
    try {
      jsonObj = JSON.parse(stripJsonComments(jsonString));
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
