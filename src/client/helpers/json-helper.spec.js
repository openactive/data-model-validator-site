import JsonHelper from './json-helper';

describe('JsonHelper', () => {
  describe('beautifyString', () => {
    it('should return beautified JSON', () => {
      const fragment = '/* test comment */{ "type": "Event", "identifier": "300", "test": "something-else", "another-prop": 76 }';
      const beautified = `{
  "type": "Event",
  "identifier": "300",
  "test": "something-else",
  "another-prop": 76
}`;
      expect(JsonHelper.beautifyString(fragment)).toBe(beautified);
    });
  });
  describe('isJSONValid', () => {
    it('should return false for invalid JSON', () => {
      const fragments = [
        '',
        '{',
        '}',
        '{\'type\': \'Event\'}',
        {},
      ];

      for (const fragment of fragments) {
        expect(JsonHelper.isJSONValid(fragment)).toBe(false);
      }
    });
    it('should return true for valid JSON', () => {
      const fragments = [
        '{}',
        '{"type": "Event"}',
        '{"type": "Event"}// hello world',
      ];

      for (const fragment of fragments) {
        expect(JsonHelper.isJSONValid(fragment)).toBe(true);
      }
    });
  });
  describe('isJSONValidObject', () => {
    it('should return false for invalid JSON', () => {
      const fragments = [
        '',
        '{',
        '}',
        '{\'type\': \'Event\'}',
        '"Test"',
        'undefined',
        'null',
        1,
        {},
      ];

      for (const fragment of fragments) {
        expect(JsonHelper.isJSONValidObject(fragment)).toBe(false);
      }
    });
    it('should return true for valid JSON', () => {
      const fragments = [
        '{}',
        '{"type": "Event"}',
        '{"type": "Event"}// hello world',
      ];

      for (const fragment of fragments) {
        expect(JsonHelper.isJSONValidObject(fragment)).toBe(true);
      }
    });
  });
});
