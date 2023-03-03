import { Monoid } from 'fp-ts/lib/Monoid';
import { concat } from './concat';
import { createDeferred } from './create-deferred';

export const monoid: Monoid<Promise<unknown>> = {
  concat,
  get empty() {
    return createDeferred();
  },
};
