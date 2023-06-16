import { noop } from 'rxjs';

export const transduce = (
  value,
  fn,
  subscribe,
  init,
  onError?,
  onComplete?
) => {
  onError = onError || noop;
  onComplete = onComplete || noop;
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

export const transducePull = <T, U = T>(
  value: T,
  fn: (a: T, c) => T | U,
  generator,
  init?
) => {
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
