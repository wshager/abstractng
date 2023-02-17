import { Subject } from 'rxjs';
import { concat } from './concat';

export const monoid = {
  concat,
  get empty() {
    return new Subject();
  },
};
