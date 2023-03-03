import { getMonoid } from 'fp-ts/lib/Array';
import { Monoid } from 'fp-ts/lib/Monoid';

export const monoid: Monoid<Array<unknown>> = {
  get concat() {
    return getMonoid<unknown>().concat;
  },
  get empty() {
    return getMonoid<unknown>().empty;
  },
};
