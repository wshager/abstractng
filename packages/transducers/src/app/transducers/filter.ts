export const filter = (predicate) => (step) => (a, c) =>
  predicate(c) ? step(a, c) : a;
