export function iterator<T>(s: Iterable<T>) {
  return s[Symbol.iterator]();
}
