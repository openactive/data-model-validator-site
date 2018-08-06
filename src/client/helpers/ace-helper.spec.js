import fs from 'fs';
import path from 'path';
import AceHelper from './ace-helper';

describe('AceHelper', () => {
  describe('buildJsonPath', () => {
    it('should compile normal path', () => {
      const arrayPath = ['$', 'location'];
      expect(AceHelper.buildJsonPath(arrayPath)).toBe('$.location');
    });
    it('should compile path with array pointer', () => {
      const arrayPath = ['$', 'location', 0];
      expect(AceHelper.buildJsonPath(arrayPath)).toBe('$.location[0]');
    });
    it('should compile path with array pointer a null param', () => {
      const arrayPath = ['$', 'location', 0];
      expect(AceHelper.buildJsonPath(arrayPath, null)).toBe('$.location[0]');
    });
    it('should escape path names containing periods', () => {
      const arrayPath = ['$', 'http://schema.org/location'];
      expect(AceHelper.buildJsonPath(arrayPath)).toBe('$["http://schema.org/location"]');
    });
  });
  describe('getTokenMap', () => {
    let generateSession;
    beforeEach(() => {
      generateSession = (file) => {
        const jsonFile = path.join(__dirname, '.spec', file);
        let tokens;
        if (fs.existsSync(jsonFile)) {
          tokens = JSON.parse(
            fs.readFileSync(jsonFile),
          );
        }
        const document = {
          getLength: () => tokens.length,
        };
        return {
          getDocument: () => document,
          getTokens: row => tokens[row],
        };
      };
    });
    it('should compile a path map for a simple object', () => {
      const session = generateSession('tokens-simple-object.json');

      const map = AceHelper.getTokenMap(session);

      expect(map).toEqual(
        {
          $: [0, 0],
          '$.type': [1, 2],
        },
      );
    });
    it('should compile a path map for a simple object containing an array', () => {
      const session = generateSession('tokens-simple-object-array.json');

      const map = AceHelper.getTokenMap(session);

      expect(map).toEqual(
        {
          $: [0, 0],
          '$.activity': [1, 2],
          '$.activity[0]': [1, 16],
        },
      );
    });
    it('should compile a path map for a simple object containing an array with 2 strings', () => {
      const session = generateSession('tokens-simple-object-array-2-elements.json');

      const map = AceHelper.getTokenMap(session);

      expect(map).toEqual(
        {
          $: [0, 0],
          '$.activity': [1, 2],
          '$.activity[0]': [1, 16],
          '$.activity[1]': [1, 27],
        },
      );
    });
    it('should compile a path map for a simple object containing an array with an object', () => {
      const session = generateSession('tokens-simple-object-array-object.json');

      const map = AceHelper.getTokenMap(session);

      expect(map).toEqual(
        {
          $: [0, 0],
          '$.organiser': [1, 2],
          '$.organiser[0]': [1, 16],
          '$.organiser[0].type': [2, 4],
        },
      );
    });
    it('should compile a path map for a simple object containing an array with an object, containing another array with an object', () => {
      const session = generateSession('tokens-simple-object-array-object-array.json');

      const map = AceHelper.getTokenMap(session);

      expect(map).toEqual(
        {
          $: [0, 0],
          '$.leader': [1, 2],
          '$.leader[0]': [1, 13],
          '$.leader[0].type': [2, 4],
          '$.leader[0].logo': [3, 4],
          '$.leader[0].logo[0]': [3, 13],
          '$.leader[0].logo[0].type': [4, 6],
          '$.leader[0].logo[0].url': [5, 6],
        },
      );
    });
    it('should compile a path map for a complex object containing multiple levels of array and object', () => {
      const session = generateSession('tokens-complex-object.json');

      const map = AceHelper.getTokenMap(session);

      expect(map).toEqual(
        {
          $: [0, 0],
          '$.leader': [1, 2],
          '$.leader[0]': [1, 13],
          '$.leader[0].type': [2, 4],
          '$.leader[0].logo': [3, 4],
          '$.leader[0].logo[0]': [3, 13],
          '$.leader[0].logo[0].type': [4, 6],
          '$.leader[0].logo[0].url': [5, 6],
          '$.leader[0].logo[1]': [7, 4],
          '$.leader[0].logo[1].type': [8, 6],
          '$.leader[0].logo[1].url': [9, 6],
          '$.leader[1]': [12, 2],
          '$.leader[1].type': [13, 4],
          '$.leader[1].logo': [14, 4],
          '$.leader[1].logo[0]': [14, 13],
          '$.leader[1].logo[0].type': [15, 6],
          '$.leader[1].logo[0].url': [16, 6],
          '$.leader[1].logo[1]': [18, 4],
          '$.leader[1].logo[1].type': [19, 6],
          '$.leader[1].logo[1].url': [20, 6],
        },
      );
    });
    it('should compile a path map for a complex object containing multiple levels of array and object and empty arrays', () => {
      const session = generateSession('tokens-complex-object-empty-arrays.json');

      const map = AceHelper.getTokenMap(session);

      expect(map).toEqual(
        {
          $: [0, 0],
          '$.leader': [1, 2],
          '$.leader[0]': [1, 13],
          '$.leader[0].type': [2, 4],
          '$.leader[0].image': [3, 4],
          '$.leader[0].logo': [4, 4],
          '$.leader[0].logo[0]': [4, 13],
          '$.leader[0].logo[0].type': [5, 6],
          '$.leader[0].logo[0].url': [6, 6],
          '$.leader[0].logo[1]': [8, 4],
          '$.leader[0].logo[1].type': [9, 6],
          '$.leader[0].logo[1].url': [10, 6],
          '$.leader[1]': [13, 2],
          '$.leader[1].type': [14, 4],
          '$.leader[1].image': [15, 4],
          '$.leader[1].logo': [16, 4],
          '$.leader[1].logo[0]': [16, 13],
          '$.leader[1].logo[0].type': [17, 6],
          '$.leader[1].logo[0].url': [18, 6],
          '$.leader[1].logo[1]': [20, 4],
          '$.leader[1].logo[1].type': [21, 6],
          '$.leader[1].logo[1].url': [22, 6],
        },
      );
    });
  });
});
