import { from, toArray } from 'rxjs';
import { transduceObservable } from './transduce';
import { doubleEvens } from '../testing/double-evens';

describe('Transduce observable', () => {
  it('should emit 4, 8, 12', () => {
    const result = transduceObservable(from([1, 2, 3, 4, 5, 6]), doubleEvens);

    result.pipe(toArray()).subscribe((arr) => {
      expect(arr).toEqual([4, 8, 12]);
    });
  });
});
