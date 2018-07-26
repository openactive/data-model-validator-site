export default class ApiHelper {
  static validate(jsonString) {
    return fetch('/api/validate', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: jsonString,
    }).then(
      res => res.json(),
    );
  }

  static validateURL(url) {
    return fetch('/api/validateUrl', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
      }),
    }).then(
      res => res.json(),
    );
  }
}
