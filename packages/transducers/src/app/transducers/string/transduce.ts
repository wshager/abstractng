import { iterator, subscribe } from '../iterable';
import { transduce, transducePull } from '../transduce';
import { getMonoid } from './get-monoid';

export const transduceString = <A, B = string>(input: string, fn, init?: B) =>
  transduce(
    input,
    fn(getMonoid().concat),
    subscribe,
    init || getMonoid().empty
  );

export const transduceStringPull = <A = Uint8Array, B = A>(
  input: string,
  fn,
  init?: B
) => {
  return transducePull(
    input,
    fn(getMonoid().concat),
    iterator,
    init || getMonoid().empty
  );
};
