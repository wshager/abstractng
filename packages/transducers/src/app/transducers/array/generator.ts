export function* generator(arr) {
  for (const x of arr) {
    yield x;
  }
}
