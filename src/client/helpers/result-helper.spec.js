import ResultHelper from './result-helper';

describe('AceHelper', () => {
  describe('itemMatch', () => {
    it('should recognise matching items', () => {
      const a = {
        category: 'data-quality',
        message: 'Please add a "type" property to this JSON object.',
        type: 'missing_required_field',
        value: {},
        severity: 'warning',
        path: '$[0].type',
        fieldName: 'type',
      };
      const b = {
        category: 'data-quality',
        message: 'Please add a "type" property to this JSON object.',
        type: 'missing_required_field',
        value: {},
        severity: 'warning',
        path: '$[1].type',
        fieldName: 'type',
      };

      expect(ResultHelper.itemMatch(a, b)).toEqual(true);
    });
    it('should recognise non-matching items', () => {
      const a = {
        category: 'data-quality',
        message: 'Please add a "type" property to this JSON object.',
        type: 'missing_required_field',
        value: {},
        severity: 'warning',
        path: '$[0].type',
        fieldName: 'type',
      };
      const b = {
        category: 'data-quality',
        message: 'Please add a "type" property to this JSON object.',
        type: 'missing_required_field',
        value: {},
        severity: 'failure',
        path: '$[1].type',
        fieldName: 'type',
      };

      expect(ResultHelper.itemMatch(a, b)).toEqual(false);
    });
  });
  describe('sortItems', () => {
    let items;
    beforeEach(() => {
      items = [
        {
          type: 'item',
          data: {
            category: 'data-quality',
            message: 'Please add a "type" property to this JSON object.',
            type: 'missing_required_field',
            value: {},
            severity: 'warning',
            path: '$[0].type',
          },
          rowCol: [2, 9],
        },
        {
          type: 'item',
          data: {
            category: 'data-quality',
            message: 'Please add a "type" property to this JSON object.',
            type: 'missing_required_field',
            value: {},
            severity: 'notice',
            path: '$["http://schema.org/description"][0].type',
          },
          rowCol: [7, 12],
        },
        {
          type: 'item',
          data: {
            category: 'data-quality',
            message: 'Please add a "type" property to this JSON object.',
            type: 'missing_required_field',
            value: {},
            severity: 'failure',
            path: '$.name',
          },
          rowCol: [3, 7],
        },
        {
          type: 'item',
          data: {
            category: 'data-quality',
            message: 'Please add a "type" property to this JSON object.',
            type: 'missing_required_field',
            value: {},
            severity: 'warning',
            path: '$[1].type',
          },
          rowCol: [22, 9],
        },
      ];
    });
    it('should sort by line number correctly', () => {
      ResultHelper.sortItems(items, 'rowCol');

      expect(items[0].data.path).toBe('$[0].type');
      expect(items[1].data.path).toBe('$.name');
      expect(items[2].data.path).toBe('$["http://schema.org/description"][0].type');
      expect(items[3].data.path).toBe('$[1].type');
    });
    it('should sort by severity correctly', () => {
      ResultHelper.sortItems(items, 'severity');

      expect(items[0].data.path).toBe('$["http://schema.org/description"][0].type');
      expect(items[1].data.path).toBe('$.name');
      expect(items[2].data.path).toBe('$[0].type');
      expect(items[3].data.path).toBe('$[1].type');
    });
  });
  describe('compareRowCol', () => {
    it('should return the correct descending row and column order', () => {
      const order = [
        [0, 0],
        [0, 1],
        [1, 1],
        [2, 0],
      ];
      const a = {
        type: 'item',
        rowCol: [],
      };
      const b = {
        type: 'item',
        rowCol: [],
      };

      for (let i = 0; i < order.length - 2; i += 1) {
        a.rowCol = order[i];
        b.rowCol = order[i + 1];
        expect(ResultHelper.compareRowCol(a, b)).toBe(-1);
      }
    });
    it('should return the correct ascending row and column order', () => {
      const order = [
        [2, 0],
        [1, 1],
        [0, 1],
        [0, 0],
      ];
      const a = {
        type: 'item',
        rowCol: [],
      };
      const b = {
        type: 'item',
        rowCol: [],
      };

      for (let i = 0; i < order.length - 2; i += 1) {
        a.rowCol = order[i];
        b.rowCol = order[i + 1];
        expect(ResultHelper.compareRowCol(a, b)).toBe(1);
      }
    });
    it('should recognise equal rowCols', () => {
      const a = {
        type: 'item',
        rowCol: [1, 1],
      };
      const b = {
        type: 'item',
        rowCol: [1, 1],
      };

      expect(ResultHelper.compareRowCol(a, b)).toBe(0);
    });
  });
  describe('compareSeverity', () => {
    it('should return the correct descending severity order', () => {
      const order = [
        'notice',
        'failure',
        'warning',
        'suggestion',
      ];
      const a = {
        type: 'item',
        data: {
          severity: 'notice',
        },
      };
      const b = {
        type: 'item',
        data: {
          severity: 'failure',
        },
      };

      for (let i = 0; i < order.length - 2; i += 1) {
        a.data.severity = order[i];
        b.data.severity = order[i + 1];
        expect(ResultHelper.compareSeverity(a, b)).toBe(-1);
      }
    });
    it('should return the correct ascending severity order', () => {
      const order = [
        'suggestion',
        'warning',
        'failure',
        'notice',
      ];
      const a = {
        type: 'item',
        data: {
          severity: 'notice',
        },
      };
      const b = {
        type: 'item',
        data: {
          severity: 'failure',
        },
      };

      for (let i = 0; i < order.length - 2; i += 1) {
        a.data.severity = order[i];
        b.data.severity = order[i + 1];
        expect(ResultHelper.compareSeverity(a, b)).toBe(1);
      }
    });
    it('should recognise equal severities', () => {
      const a = {
        type: 'item',
        data: {
          severity: 'notice',
        },
      };
      const b = {
        type: 'item',
        data: {
          severity: 'notice',
        },
      };

      expect(ResultHelper.compareSeverity(a, b)).toBe(0);
    });
  });
});
