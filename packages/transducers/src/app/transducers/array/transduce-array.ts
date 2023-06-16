import { iterable } from '..';
import { iterator } from '../iterable';
import { transduce, transducePull } from '../transduce';
import { getMonoid } from './get-monoid';

export const transduceArrayPull = <A, B = A[]>(input: A[], fn, init?: B) =>
  transducePull(
    input,
    fn(getMonoid().concat),
    iterator,
    init || getMonoid().empty
  );

export const transduceArray = <A, B = A[]>(input: A[], fn, init?: B): B =>
  transduce(
    input,
    fn(getMonoid().concat),
    iterable.subscribe,
    init || getMonoid().empty
  );
