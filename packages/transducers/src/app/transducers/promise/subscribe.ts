export function subscribe(p, { next, error, complete }) {
  p.then(next).catch(error).finally(complete);
}
