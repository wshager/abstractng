import { Observable, Observer, Subscription } from 'rxjs';

export const subscribe = <T>(
  o: Observable<T>
): ((s: Observer<T>) => Subscription) => o.subscribe;
