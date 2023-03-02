import { array, string, transduce, transducePush } from '.';
import { Either } from 'fp-ts/lib/Either';
import * as either from './either';
import { iterator } from './iterable/iterator';

export const transduceArray = (input: number[], fn) =>
  transduce(input, fn(array.monoid.concat), iterator, []);

export const transduceEither = <E, A>(input: Either<E, A>, fn): Either<E, A> =>
  transduce(input, fn(either.concat), either.generator, input);

export const transducePromise = <T>(input: Promise<T>, fn) =>
  transducePush(input, fn);

export const transduceString = (input: string, fn) => {
  return transduce(input, fn(string.monoid.concat), iterator, '');
};

export const transduceArrayPush = (input: number[], fn) =>
  transducePush(input, fn);

export const transduceObservable = (input: unknown, fn) =>
  transducePush(input, fn);
