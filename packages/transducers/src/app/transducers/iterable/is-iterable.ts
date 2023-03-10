import { isObject } from '../is-object';

export const isIterable = (object: unknown): object is Iterable<unknown> =>
  isObject(object) && Symbol.iterator in object;
