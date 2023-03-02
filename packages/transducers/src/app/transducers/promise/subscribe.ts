export function subscribe<T>(p: Promise<T>, { next, error, complete }) {
  p.then(next).catch(error).finally(complete);
}
