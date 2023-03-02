import { Observer } from 'rxjs';

export interface Subscribable<T, K> {
  subscribe: (val: T, observer: Partial<Observer<K>>) => void;
  error: (val: T) => (err: any) => void;
  complete: (val: T) => () => void;
}
