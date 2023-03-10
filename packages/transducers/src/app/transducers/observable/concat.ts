import { isObservable } from 'rxjs';
import { merge } from '../operators';

export const concat = (a, c) => {
  if (isObservable(c)) {
    return merge()(concat)(a, c);
  }
  a.next(c);
  return a;
};
