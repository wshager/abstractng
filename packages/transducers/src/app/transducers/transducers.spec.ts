import { transduceArray } from './transducers';

describe('Transducers', () => {
  describe('Transduce array', () => {
    it('should return [4, 8, 12]', () => {
      const result = transduceArray([1, 2, 3, 4, 5, 6]);

      expect(result).toEqual([4, 8, 12]);
    });
  });
});
