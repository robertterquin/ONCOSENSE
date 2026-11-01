import { createElement, Fragment, isValidElement } from 'react';

import { flattenRows } from '../flattenRows';

const row = (key: string) => createElement('row', { key });

describe('flattenRows', () => {
  it('opens fragments so each row is its own item, with unique keys', () => {
    const rows = flattenRows([
      row('a'),
      createElement(Fragment, { key: 'list' }, row('b'), row('c')),
      null,
      false,
    ]);
    expect(rows).toHaveLength(3);
    const keys = rows.map((item) => (isValidElement(item) ? item.key : null));
    expect(new Set(keys).size).toBe(3);
  });
});
