import { noop, Observable } from 'rxjs';
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

export const transducePush = (value, fn) => {
  const { subscribe, concat, empty, error, complete } = getDefaults(value);
  let init = empty;
  if (!subscribe || !concat) {
    throw new Error('Cannot transduce type');
  }
  const xform = fn(concat);
  subscribe(value, {
    next: (cur) => {
      init = xform(init, cur);
    },
    error,
    complete,
  });
  return init;
};

function getDefaults(value) {
  if (Symbol.iterator in value) {
    return getIterableDefaults(value);
  }
  let subscribe,
    concat,
    empty,
    error,
    complete = noop;
  if (value instanceof Promise) {
    subscribe = promise.subscribe;
    concat = promise.monoid.concat;
    empty = promise.monoid.empty;
    error = empty.reject;
  } else if (value instanceof Observable) {
    subscribe = observable.subscribe;
    concat = observable.monoid.concat;
    empty = observable.monoid.empty;
    error = empty.error;
    complete = empty.complete;
  }
  return { subscribe, concat, empty, error, complete };
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
