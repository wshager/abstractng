export const transduce = (value, fn, generator, init) => {
  const source = generator(value);
  let cur = source.next();
  do {
    init = fn(init, cur.value);
    cur = source.next();
  } while (!cur.done);
  return init;
};
