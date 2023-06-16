import { isObservable } from 'rxjs';
import { merge } from '../operators';
import { transduceObservable } from './transduce';

export const concat = (a, c) => {
  if (isObservable(c)) {
    return merge(transduceObservable)(concat)(a, c);
  }
  a.next(c);
  return a;
};
