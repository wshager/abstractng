import { noop } from 'rxjs';
import { transduce } from '../transduce';
import { getMonoid } from './get-monoid';
import { onError } from './on-error';
import { subscribe } from './subscribe';

export const transducePromise = <A, B = A>(
  input: Promise<A>,
  fn,
  init?: B,
  onComplete?
) =>
  transduce(
    input,
    fn(getMonoid().concat),
    subscribe,
    init || getMonoid().empty,
    onError,
    onComplete || noop
  );
