import { asyncScheduler, noop, of, throwError, toArray } from 'rxjs';
import {
  array,
  transduce,
  observable,
  promise,
  iterable,
  transducePull,
} from '.';

describe('Transduce', () => {
  it('should transduce array', () => {
    const result = transduce(
      [1, 2, 3],
      array.getMonoid().concat,
      iterable.subscribe,
      array.getMonoid().empty
    );

    expect(result).toEqual([1, 2, 3]);
  });

  it('should transduce array pull', () => {
    const result = transducePull(
      [1, 2, 3],
      array.getMonoid().concat,
      iterable.iterator,
      array.getMonoid().empty
    );

    expect(result).toEqual([1, 2, 3]);
  });

  it('should transduce promise', async () => {
    const result = transduce(
      Promise.resolve(1),
      promise.getMonoid().concat,
      promise.subscribe,
      promise.getMonoid().empty
    );

    expect(await result).toBe(1);
  });

  it('should transduce and reject promise', async () => {
    const result = transduce(
      Promise.reject('ble'),
      promise.getMonoid().concat,
      promise.subscribe,
      promise.getMonoid().empty,
      promise.onError
    );

    await result.catch((err) => {
      expect(err).toBe('ble');
    });
  });

  it('should transduce observable', () => {
    const result = transduce(
      of(1),
      observable.getMonoid().concat,
      observable.subscribe,
      observable.getMonoid().empty,
      observable.onError,
      observable.onComplete
    );

    result.subscribe((val) => {
      expect(val).toBe(1);
    });
  });

  it('should transduce and throw observable', () => {
    const result = transduce(
      throwError(() => new Error('ble')),
      observable.getMonoid().concat,
      observable.subscribe,
      observable.getMonoid().empty,
      observable.onError,
      observable.onComplete
    );

    result.subscribe({
      error: (err) => {
        expect(err).toBe('ble');
      },
    });
  });
});

describe('Into', () => {
  it('should convert array to observable', () => {
    const observableMonoid = observable.getMonoid<number>();
    const result = transduce(
      [1, 2, 3],
      observableMonoid.concat,
      iterable.subscribe,
      observableMonoid.empty
    );

    result.pipe(toArray()).subscribe((a) => {
      expect(a).toEqual([1, 2, 3]);
    });
  });

  it('should convert array to promise', async () => {
    const result = transduce(
      [1, 2, 3],
      promise.getMonoid().concat,
      iterable.subscribe,
      promise.getMonoid().empty
    );

    expect(await result).toBe(1);
  });

  it('should convert promise to array', () => {
    transduce(
      Promise.resolve(2),
      array.getMonoid().concat,
      promise.subscribe,
      array.getMonoid().empty,
      noop,
      (arr) => {
        expect(arr).toEqual([2]);
      }
    );
  });

  it('should convert observable to array', () => {
    transduce(
      of(1, 2, 3, asyncScheduler),
      array.getMonoid().concat,
      observable.subscribe,
      array.getMonoid().empty,
      noop,
      (arr) => {
        expect(arr).toEqual([1, 2, 3]);
      }
    );
  });
});
