import { scaledType, typeScale } from '../type';

describe('scaledType', () => {
  it('keeps Default sizes as designed', () => {
    expect(scaledType('body', 'default')).toMatchObject({ fontSize: 17, lineHeight: 25 });
  });

  it('grows text and line height together for Large and Larger', () => {
    expect(scaledType('body', 'large')).toMatchObject({ fontSize: 20, lineHeight: 29 });
    expect(scaledType('body', 'larger')).toMatchObject({ fontSize: 22, lineHeight: 33 });
  });

  it('never goes below 14px at Default', () => {
    for (const style of Object.values(typeScale)) expect(style.fontSize).toBeGreaterThanOrEqual(14);
  });
});
