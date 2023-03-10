import { either } from 'fp-ts';
import { asyncScheduler, from, of, toArray } from 'rxjs';
import {
  array,
  map,
  filter,
  compose,
  merge,
  transduce,
  transducePush,
  observable,
  promise,
} from '.';
import { iterator } from './iterable';
import {
  transduceArray,
  transduceArrayPush,
  transduceEither,
  transduceObservable,
  transducePromise,
  transduceString,
} from './transducers';

const isEven = (n) => n % 2 === 0;
const double = (n) => n * 2;
const doubleEvens = compose(filter(isEven), map(double));
const prependHello = (a: string) => `hello ${a}`;
const isWorld = (a: string) => a === 'world';
const hello = compose(filter(isWorld), map(prependHello));

describe('Transducers', () => {
  describe('Transduce array', () => {
    it('should return [4, 8, 12]', () => {
      const result = transduceArray([1, 2, 3, 4, 5, 6], doubleEvens);

      expect(result).toEqual([4, 8, 12]);
    });

    it('should return empty array', () => {
      const result = transduceArray([], doubleEvens);

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
      const f = map((cur) => cur + 1)(array.getMonoid().concat);
      const result = [1, 2, 3].reduce(f, []);

      expect(result).toEqual([2, 3, 4]);
    });
  });

  describe('Transduce array push', () => {
    it('should return [4, 8, 12]', () => {
      const result = transduceArrayPush([1, 2, 3, 4, 5, 6], doubleEvens);

      expect(result).toEqual([4, 8, 12]);
    });

    it('should return empty array', () => {
      const result = transduceArrayPush([], doubleEvens);

      expect(result).toEqual([]);
    });
  });

  describe('Transduce Either', () => {
    it('should return "hello world"', () => {
      const concat = (acc: string, cur: string) => `${acc} ${cur}`;

      const result = either.reduce('hello', concat)(either.right('world'));

      expect(result).toBe('hello world');
    });

    it('should return a right either with value "hello world"', () => {
      const result = transduceEither(either.right('world'), hello);

      expect(either.isRight(result)).toBeTruthy();
      expect(either.toUnion(result)).toBe('hello world');
    });

    it('should NOT return a right either with value "hello world"', () => {
      const result = transduceEither(either.left('error'), hello);

      expect(either.isRight(result)).toBeFalsy();
      expect(either.toUnion(result)).toBe('error');
    });
  });

  describe('Transduce Promise', () => {
    const reducePromise = async (p, f, init) => {
      return f(init, await p);
    };
    it('should return "hello world"', async () => {
      const concat = (acc: string, cur: string) => `${acc} ${cur}`;

      const result = await reducePromise(
        Promise.resolve('world'),
        concat,
        'hello'
      );

      expect(result).toBe('hello world');
    });

    it('should throw', async () => {
      const concat = (acc: string, cur: string) => `${acc} ${cur}`;

      reducePromise(Promise.reject('world'), concat, 'hello').catch((error) => {
        expect(error).toBe('world');
      });
    });

    it('should return a promise that contains "hello world"', async () => {
      const result = transducePromise(Promise.resolve('world'), hello);

      expect(await result).toBe('hello world');
    });

    it('should return a reject promise', () => {
      const result = transducePromise(Promise.reject('err'), hello);

      expect(result).rejects.toBeTruthy();
    });
  });

  describe('Transduce string', () => {
    it('should return hello w', () => {
      const isW = (a: string) => a === 'w';
      const hello = compose(filter(isW), map(prependHello));
      const result = transduceString('world', hello);

      expect(result).toEqual('hello w');
    });
  });

  describe('Transduce observable', () => {
    it('should emit 4, 8, 12', () => {
      const result = transduceObservable(from([1, 2, 3, 4, 5, 6]), doubleEvens);

      result.pipe(toArray()).subscribe((arr) => {
        expect(arr).toEqual([4, 8, 12]);
      });
    });
  });

  describe('Mergemap', () => {
    it('should merge arrays', () => {
      const result = [
        [1, 2, 3],
        [4, 5, 6],
      ].reduce(
        merge()((a, c) => a.concat([c])),
        []
      );

      expect(result).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it('should mergeMap', () => {
      const mergeMap = (f) => compose(map(f), merge());
      const xform = compose(mergeMap((x) => [x, x * 2]))(
        array.getMonoid().concat
      );

      const result = transduce(
        [1, 2, 3],
        xform,
        iterator,
        array.getMonoid().empty
      );

      expect(result).toEqual([1, 2, 2, 4, 3, 6]);
    });
  });

  describe('Into', () => {
    it('should convert array to observable', () => {
      const result = transducePush(
        [1, 2, 3],
        observable.getMonoid().concat,
        observable.getMonoid().empty
      );

      result.pipe(toArray()).subscribe((a) => {
        expect(a).toEqual([1, 2, 3]);
      });
    });

    it('should convert array to promise', async () => {
      const result = transducePush(
        [1, 2, 3],
        promise.getMonoid().concat,
        promise.getMonoid().empty
      );

      expect(await result).toBe(1);
    });

    it('should convert promise to array', () => {
      transducePush(
        Promise.resolve(2),
        array.getMonoid().concat,
        array.getMonoid().empty,
        (arr) => {
          expect(arr).toEqual([2]);
        }
      );
    });

    it('should convert observable to array', () => {
      transducePush(
        of(1, 2, 3, asyncScheduler),
        array.getMonoid().concat,
        array.getMonoid().empty,
        (arr) => {
          expect(arr).toEqual([1, 2, 3]);
        }
      );
    });
  });
});
