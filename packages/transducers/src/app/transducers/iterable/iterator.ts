export function iterator<T>(iterable: Iterable<T>) {
  return iterable[Symbol.iterator]();
}
