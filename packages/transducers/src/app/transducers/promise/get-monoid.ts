import { Monoid } from 'fp-ts/lib/Monoid';
import { concat } from './concat';
import { createDeferred } from './create-deferred';

export const getMonoid = <T>(): Monoid<Promise<T>> => ({
  concat,
  get empty() {
    return createDeferred<T>();
  },
});
