import { isObservable, noop } from 'rxjs';
import { array, iterable, observable, promise, string } from '.';
import { isIterable } from './iterable/is-iterable';
import { isPromise } from './promise/is-promise';

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

export const transducePush = (value, fn, init?, complete?) => {
  const { subscribe, concat, empty, onError, onComplete } = getDefaults(value);
  if (init == null) {
    init = empty;
    fn = fn(concat);
  }
  if (!complete) {
    complete = onComplete;
  }
  if (!subscribe || !concat) {
    throw new Error('Cannot transduce type');
  }
  subscribe(value, {
    next: (cur) => {
      init = fn(init, cur);
    },
    error: (err) => {
      onError(init, err);
    },
    complete: () => {
      onComplete(init);
    },
  });
  return init;
};

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
  const onError = noop;
  const onComplete = noop;
  const subscribe = iterable.subscribe;
  if (Array.isArray(value)) {
    concat = array.getMonoid().concat;
    empty = array.getMonoid().empty;
  } else if (typeof value === 'string') {
    concat = string.getMonoid().concat;
    empty = string.getMonoid().empty;
  }
  return { subscribe, concat, empty, onError, onComplete };
}

const getPromiseDefaults = () => ({
  subscribe: promise.subscribe,
  concat: promise.getMonoid().concat,
  empty: promise.getMonoid().empty,
  onError: promise.onError,
  onComplete: noop,
});

const getObservableDefaults = () => ({
  subscribe: observable.subscribe,
  concat: observable.getMonoid().concat,
  empty: observable.getMonoid().empty,
  onError: (a, err) => {
    a.error(err);
  },
  onComplete: (a) => {
    a.complete();
  },
});
