import { Observable } from 'rxjs';

export function subscribe(arr, { next, error, complete }) {
  try {
    for (const x of arr) {
      next(x);
    }
  } catch (err) {
    error(err);
  }
  complete();
}
