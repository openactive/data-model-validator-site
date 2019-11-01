export default class ApiHelper {
  static handleResponse(res, jsonString) {
    if (res.ok) {
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

  static validate(jsonString, version, validationMode) {
    return fetch(`/api/validate/${version}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ json: jsonString, validationMode }),
    }).then(
      res => ApiHelper.handleResponse(res, jsonString),
    );
  }

  static validateURL(url, version, validationMode) {
    return fetch(`/api/validateUrl/${version}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        validationMode,
      }),
    }).then(
      res => ApiHelper.handleResponse(res),
    );
  }
}
