import { isObservable, noop } from 'rxjs';
import { isPromise } from 'util/types';
import { observable, promise } from '..';
import { iterator } from '../iterable';
import { transduce, transducePush } from '../transduce';
export const merge = () => (step) => (a, c) => {
  return transducePush(c, step, a);
};
