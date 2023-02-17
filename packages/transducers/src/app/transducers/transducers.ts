import {
  array,
  compose,
  filter,
  map,
  string,
  transduce,
  transducePush,
} from '.';
import { Either } from 'fp-ts/lib/Either';
import * as either from './either';
import { iterator } from './iterable/iterator';
import { Observable } from 'rxjs';

const isEven = (n) => n % 2 === 0;
const double = (n) => n * 2;
const doubleEvens = compose(filter(isEven), map(double));
const prependHello = (a: string) => `hello ${a}`;
const isWorld = (a: string) => a === 'world';
const hello = compose(filter(isWorld), map(prependHello));

export const transduceArray = (input: number[]) =>
  transduce(input, doubleEvens(array.monoid.concat), iterator, []);

export const transduceEither = <E, A>(input: Either<E, A>): Either<E, A> =>
  transduce(input, hello(either.concat), either.generator, input);

export const transducePromise = <T>(input: Promise<T>) =>
  transducePush(input, hello);

export const transduceString = (input: string) => {
  const isW = (a: string) => a === 'w';
  const hello = compose(filter(isW), map(prependHello));
  return transduce(input, hello(string.monoid.concat), iterator, '');
};

export const transduceArrayPush = (input: number[]) =>
  transducePush(input, doubleEvens);

export const transduceObservable = (input: Observable<number>) =>
  transducePush(input, doubleEvens);
