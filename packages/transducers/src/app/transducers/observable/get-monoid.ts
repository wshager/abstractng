import { Monoid } from 'fp-ts/lib/Monoid';
import { Observable, Subject } from 'rxjs';
import { concat } from './concat';

export const getMonoid = <T>(): Monoid<Observable<T>> => ({
  concat,
  get empty() {
    return new Subject<T>();
  },
});
