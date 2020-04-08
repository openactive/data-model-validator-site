export default class ApiHelper {
  static handleResponse(res, jsonString) {
    if (res.ok || res.status === 400) {
      return res.json();
    }
    switch (res.status) {
      case 413:
        return {
          json: jsonString,
          response: [
            {
              category: 'data-quality',
              severity: 'failure',
              path: '$',
              message: 'The JSON you\'ve entered is too big to be validated.',
            },
          ],
        };
      default:
        return {
          json: jsonString,
          response: [
            {
              category: 'internal',
              severity: 'failure',
              path: '$',
              message: 'The server encountered an unexpected error whilst processing your request.',
            },
          ],
        };
    }
  }

  static validateJSON(jsonString, version, validationMode) {
    return this.validate({ json: jsonString }, version, validationMode)
      .then(res => ApiHelper.handleResponse(res, jsonString));
  }

  static validateURL(url, version, validationMode) {
    return this.validate({ url }, version, validationMode)
      .then(res => ApiHelper.handleResponse(res));
  }

  static validate(data, version, validationMode) {
    let body = Object.assign({}, data, { validationMode });
    body = JSON.stringify(body);
    return fetch(`/api/validate/${version}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body,
    });
  }
}
