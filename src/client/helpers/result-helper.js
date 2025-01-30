import AceHelper from './ace-helper';

export default class ResultHelper {
  static groupItems(items, tokenMap, merge = true) {
    const groupedItems = [];
    for (const item of items) {
      const rowCol = AceHelper.getRowCol(item.path, tokenMap);
      let match = false;
      let index = 0;
      const mergedItem = {
        fieldName: AceHelper.fieldName(item.path),
        ...item,
      };
      if (merge) {
        for (const groupedItem of groupedItems) {
          if (this.itemMatch(groupedItem.data, mergedItem)) {
            match = true;
            break;
          }
          index += 1;
        }
      }
      if (!match) {
        groupedItems.push(
          {
            type: 'item',
            data: mergedItem,
            key: `${mergedItem.type}-${mergedItem.severity}-${mergedItem.fieldName}-${rowCol[0]}:${rowCol[1]}`,
            rowCol,
          },
        );
      } else {
        const matchedItem = groupedItems[index];
        if (matchedItem.type === 'item') {
          matchedItem.type = 'group';
          matchedItem.paths = [];
        }
        matchedItem.paths.push(
          {
            fieldName: mergedItem.fieldName,
            rowCol,
            path: mergedItem.path,
          },
        );
        if (
          rowCol[0] < matchedItem.rowCol[0]
          || (
            rowCol[0] === matchedItem.rowCol[0]
            && rowCol[1] < matchedItem.rowCol[1]
          )
        ) {
          matchedItem.rowCol = rowCol;
        }
      }
    }
    for (const item of groupedItems) {
      if (item.type === 'group') {
        item.paths.sort(this.compareRowCol);
      }
    }
    return groupedItems;
  }

  static itemMatch(a, b) {
    return (
      a.type === b.type
      && a.severity === b.severity
      && a.message === b.message
      && a.fieldName === b.fieldName
    );
  }

  static sortItems(items, type) {
    let comparator;
    switch (type) {
      case 'rowCol':
        comparator = (a, b) => {
          const retValue = this.compareRowCol(a, b);
          if (retValue === 0) {
            return this.compareSeverity(a, b);
          }
          return retValue;
        };
        break;
      case 'severity':
      default:
        comparator = (a, b) => {
          const retValue = this.compareSeverity(a, b);
          if (retValue === 0) {
            return this.compareRowCol(a, b);
          }
          return retValue;
        };
        break;
    }
    items.sort(comparator);
  }

  static compareRowCol(a, b) {
    if (
      a.rowCol[0] < b.rowCol[0]
      || (
        a.rowCol[0] === b.rowCol[0]
        && a.rowCol[1] < b.rowCol[1]
      )
    ) {
      return -1;
    }
    if (
      a.rowCol[0] === b.rowCol[0]
      && a.rowCol[1] === b.rowCol[1]
    ) {
      return 0;
    }
    return 1;
  }

  static compareSeverity(a, b) {
    if (a.data.severity === b.data.severity) {
      return 0;
    }
    const order = {
      notice: 0,
      failure: 1,
      warning: 2,
      suggestion: 3,
    };
    const aMap = order[a.data.severity];
    const bMap = order[b.data.severity];
    if (aMap < bMap) {
      return -1;
    }
    return 1;
  }
}
