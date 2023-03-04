import { isObservable, noop } from 'rxjs';
import { array, iterable, observable, promise, string } from '.';

export const transduce = (value, fn, generator, init?) => {
  const source = generator(value);
  let cur = source.next();
  if (init === undefined) {
    init = cur.value;
    cur = source.next();
  }
  while (!cur.done) {
    init = fn(init, cur.value);
    cur = source.next();
  }
  return init;
};

export const transducePush = (value, fn, init?) => {
  const { subscribe, concat, empty, error, complete } = getDefaults(value);
  if (init == null) {
    init = empty;
    fn = fn(concat);
  }
  if (!subscribe || !concat) {
    throw new Error('Cannot transduce type');
  }
  subscribe(value, {
    next: (cur) => {
      init = fn(init, cur);
    },
    error: (err) => {
      error(init, err);
    },
    complete: () => {
      complete(init);
    },
  });
  return init;
};

const isObject = (object: unknown): object is Record<string, unknown> =>
  !!object && (typeof object === 'object' || typeof object === 'function');

const isPromise = (object: unknown): object is Promise<unknown> =>
  object instanceof Promise ||
  (isObject(object) &&
    typeof object.then === 'function' &&
    typeof object.catch === 'function');

const isIterable = (object: unknown): object is Iterable<unknown> =>
  isObject(object) && Symbol.iterator in object;

function getDefaults(value) {
  if (isIterable(value)) {
    return getIterableDefaults(value);
  }
  if (isPromise(value)) {
    return getPromiseDefaults();
  }
  if (isObservable(value)) {
    return getObservableDefaults();
  }
}

function getIterableDefaults(value) {
  let concat, empty;
  const error = noop;
  const complete = noop;
  const subscribe = iterable.subscribe;
  if (Array.isArray(value)) {
    concat = array.monoid.concat;
    empty = array.monoid.empty;
  } else if (typeof value === 'string') {
    concat = string.monoid.concat;
    empty = string.monoid.empty;
  }
  return { subscribe, concat, empty, error, complete };
}

const getPromiseDefaults = () => ({
  subscribe: promise.subscribe,
  concat: promise.monoid.concat,
  empty: promise.monoid.empty,
  error: promise.onError,
  complete: noop,
});

const getObservableDefaults = () => ({
  subscribe: observable.subscribe,
  concat: observable.monoid.concat,
  empty: observable.monoid.empty,
  error: (a, err) => {
    a.error(err);
  },
  complete: (a) => {
    a.complete();
  },
});
