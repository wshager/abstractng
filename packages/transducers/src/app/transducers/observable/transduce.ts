import { Observable } from 'rxjs';
import { transduce } from '../transduce';
import { getMonoid } from './get-monoid';
import { subscribe } from './subscribe';
import { onError } from './on-error';
import { onComplete } from './on-complete';

export const transduceObservable = <A, B = Observable<A>>(
  input: Observable<A>,
  fn,
  init?: B
) =>
  transduce(
    input,
    fn(getMonoid().concat),
    subscribe,
    init || getMonoid().empty,
    onError,
    onComplete
  );
