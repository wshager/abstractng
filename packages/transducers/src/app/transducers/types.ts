import { HKT, Kind, URIS } from 'fp-ts/HKT';
import { Observer } from 'rxjs';

export interface Subscribable<T> {
  readonly URI: T;
  subscribe: <K>(val: HKT<T, K>, observer: Partial<Observer<K>>) => void;
  error: (val: T) => (err: unknown) => void;
  complete: (val: T) => () => void;
}

export interface Transducable<T, U = T> {
  readonly URI: T;
  transduce<A, B = A, C = A>(
    input: HKT<T, A>,
    fn: (a: HKT<T, A>, c: A) => HKT<U, B> | B,
    init?: HKT<U, C>
  );
}

export interface Transducable1<T extends URIS, U extends URIS = T> {
  readonly URI: T;
  transduce<A, B = A, C = A>(
    input: Kind<T, A>,
    fn: (a: Kind<T, A>, c: A) => Kind<U, B> | B,
    init?: Kind<U, C>
  );
}
