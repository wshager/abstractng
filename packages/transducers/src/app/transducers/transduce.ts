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

export const transducePush = (value, fn, next, error, complete, init) => {
  next(
    value,
    (cur) => {
      init = fn(init, cur);
    },
    (err) => {
      error(err);
    },
    complete
  );
  return init;
};
