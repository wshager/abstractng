import { concat } from './concat';
import { createDeferred } from './create-deferred';

export const monoid = {
  concat,
  get empty() {
    return createDeferred();
  },
};
