import { either } from 'fp-ts';
import { identity } from 'fp-ts/lib/function';
import { transduceArray, transduceEither } from './transducers';

describe('Transducers', () => {
  describe('Transduce array', () => {
    it('should return [4, 8, 12]', () => {
      const result = transduceArray([1, 2, 3, 4, 5, 6]);

      expect(result).toEqual([4, 8, 12]);
    });

    it('should return empty array', () => {
      const result = transduceArray([]);

      expect(result).toEqual([]);
    });

    it('should return empty array', () => {
      const result = [1, 2, 3].reduce((a, c) => a + c);

      expect(result).toEqual(6);
    });
  });

  describe('Transduce Either', () => {
    it('should return "hello ipek"', () => {
      const concat = (acc: string, cur: string) => `${acc} ${cur}`;

      const result = either.reduce('hello', concat)(either.right('ipek'));

      expect(result).toBe('hello ipek');
    });

    it('should return a right either with value "hello ipek"', () => {
      const result = transduceEither(either.right('ipek'));

      expect(either.isRight(result)).toBeTruthy();
      expect(either.fold(identity, identity)(result)).toBe('hello ipek');
    });

    it('should NOT return a right either with value "hello ipek"', () => {
      const result = transduceEither(either.left('error'));

      expect(either.isRight(result)).toBeFalsy();
      expect(either.fold(identity, identity)(result)).toBe('error');
    });
  });
});
