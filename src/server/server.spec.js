const request = require('request');
const server = require('./server');

const port = 8085;

describe('server', () => {
  let app;
  beforeAll(() => {
    app = server.createServer(port);
  });
  afterAll(() => {
    app.close();
  });
  describe('GET /', () => {
    const data = {};
    beforeAll((done) => {
      request.get(`http://localhost:${port}/`, (error, response, body) => {
        data.status = response.statusCode;
        data.body = body;
        done();
      });
    });
    it('should have status 200', () => {
      expect(data.status).toBe(200);
    });
    it('should have a body containing html', () => {
      expect(data.body).toContain('OpenActive Validator');
    });
  });
  describe('POST /api/validate', () => {
    const data = {};
    const options = {
      method: 'post',
      body: { type: 'Event' },
      json: true,
      url: `http://localhost:${port}/api/validate`,
    };
    beforeAll((done) => {
      request(options, (error, response, body) => {
        data.status = response.statusCode;
        data.body = body;
        done();
      });
    });
    it('should have status 200', () => {
      expect(data.status).toBe(200);
    });
    it('should have errors, warnings and notices', () => {
      expect(data.body.length).toBeGreaterThan(0);
    });
  });
});
