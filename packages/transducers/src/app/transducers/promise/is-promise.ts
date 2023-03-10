import { isObject } from '../is-object';

export const isPromise = (object: unknown): object is Promise<unknown> =>
  object instanceof Promise ||
  (isObject(object) &&
    typeof object.then === 'function' &&
    typeof object.catch === 'function');
