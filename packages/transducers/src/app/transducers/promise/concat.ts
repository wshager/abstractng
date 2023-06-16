import { isPromise } from 'util/types';
import { merge } from '../operators';
import { Deferred } from './create-deferred';
import { transducePromise } from './transduce';

export const concat = <T>(a: Deferred<T>, c: Promise<T> | T) => {
  if (isPromise(c)) {
    return merge(transducePromise)(concat)(a, c);
  }
  a.resolve(c);
  return a;
};
