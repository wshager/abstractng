import { transduceArray, transduceArrayPull } from './transduce-array';
import { doubleEvens } from '../testing/double-evens';
import { compose, filter, map, merge, transduce, transducePull } from '..';
import { getMonoid } from './get-monoid';
import { iterator } from '../iterable';

describe('Transduce array pull', () => {
  it('should return [4, 8, 12]', () => {
    const result = transduceArrayPull([1, 2, 3, 4, 5, 6], doubleEvens);

    expect(result).toEqual([4, 8, 12]);
  });

  it('should return empty array', () => {
    const result = transduceArrayPull([], doubleEvens);

    expect(result).toEqual([]);
  });

  it('should return empty array', () => {
    const result = [1, 2, 3].reduce((a, c) => a + c);

    expect(result).toEqual(6);
  });

  it('should filter', () => {
    const f = filter((c) => c > 1)((a, c) => a + c);
    const result = [1, 2, 3].reduce(f, 0);

    expect(result).toEqual(5);
  });

  it('should map', () => {
    const f = map((cur) => cur + 1)(getMonoid().concat);
    const result = [1, 2, 3].reduce(f, []);

    expect(result).toEqual([2, 3, 4]);
  });
});

describe('Transduce array push', () => {
  it('should return [4, 8, 12]', () => {
    const result = transduceArray([1, 2, 3, 4, 5, 6], doubleEvens);

    expect(result).toEqual([4, 8, 12]);
  });

  it('should return empty array', () => {
    const result = transduceArray([], doubleEvens);

    expect(result).toEqual([]);
  });
});

describe('Mergemap', () => {
  it('should merge arrays', () => {
    const result = [
      [1, 2, 3],
      [4, 5, 6],
    ].reduce(
      merge(transduceArray)((a, c) => a),
      []
    );

    expect(result).toEqual([1, 2, 3, 4, 5, 6]);
  });

  fit('should mergeMap', () => {
    const monoidArray = getMonoid<number>();
    const xform = compose(map((x) => [x, x * 2]));

    const result = transducePull(
      [1, 2, 3],
      xform(monoidArray.concat),
      iterator,
      monoidArray.empty
    );

    expect(result).toEqual([1, 2, 2, 4, 3, 6]);
  });
});
