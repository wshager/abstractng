import { array, compose, filter, map, transduce } from '.';
import { Either } from 'fp-ts/lib/Either';
import * as either from './either';

// updater function: array.concat
// initial value: array
export const transduceArray = (input: number[]) => {
  const isEven = (n) => n % 2 === 0;
  const double = (n) => n * 2;
  const doubleEvens = compose(filter(isEven), map(double));

  const xform = doubleEvens(array.concat);

  return transduce(input, xform, array.generator, []);
};

// updater function: Either<E,A> => Either<E,A>
// initial value: Either<E,A>
export function transduceEither<E, A>(input: Either<E, A>): Either<E, A> {
  const prependHello = (a: string) => `hello ${a}`;
  const isIpek = (a: string) => a === 'ipek';
  const hello = compose(filter(isIpek), map(prependHello));

  const xform = hello(either.map);

  return transduce(input, xform, either.generator, input);
}
