import {
  array,
  compose,
  createDeferred,
  filter,
  map,
  promise,
  string,
  transduce,
  transducePush,
} from '.';
import { Either } from 'fp-ts/lib/Either';
import * as either from './either';
import { iterator } from './iterator';
import { noop } from 'rxjs';

// updater function: array.concat
// initial value: empty array
export const transduceArray = (input: number[]) => {
  const isEven = (n) => n % 2 === 0;
  const double = (n) => n * 2;
  const doubleEvens = compose(filter(isEven), map(double));

  const xform = doubleEvens(array.concat);

  return transduce(input, xform, iterator, []);
};

// updater function: either.replaceRight
// initial value: input
export function transduceEither<E, A>(input: Either<E, A>): Either<E, A> {
  const prependHello = (a: string) => `hello ${a}`;
  const isWorld = (a: string) => a === 'world';
  const hello = compose(filter(isWorld), map(prependHello));

  const xform = hello(either.concat);

  return transduce(input, xform, either.generator, input);
}

// updater function: promise.update
// initial value: deferred
export const transducePromise = <T>(input: Promise<T>) => {
  const prependHello = (a: string) => `hello ${a}`;
  const isWorld = (a: string) => a === 'world';
  const hello = compose(filter(isWorld), map(prependHello));
  const xform = hello(promise.concat);

  return transducePush(
    input,
    xform,
    (p, next, error, complete) =>
      p.then((v) => {
        next(v);
        complete();
      }, error),
    console.error,
    noop,
    createDeferred()
  );
};

// updater function: string.concat
// initial value: empty string
export const transduceString = (input: string) => {
  const prependHello = (a: string) => `hello ${a}`;
  const isW = (a: string) => a === 'w';
  const hello = compose(filter(isW), map(prependHello));

  const xform = hello(string.concat);

  return transduce(input, xform, iterator, '');
};

// updater function: array.concat
// initial value: empty array
export const transduceArrayPush = (input: number[]) => {
  const isEven = (n) => n % 2 === 0;
  const double = (n) => n * 2;
  const doubleEvens = compose(filter(isEven), map(double));

  const xform = doubleEvens(array.concat);

  return transducePush(
    input,
    xform,
    (arr, next, error, complete) => {
      try {
        for (const x of arr) {
          next(x);
        }
      } catch (err) {
        error(err);
      }
      complete();
    },
    console.error,
    noop,
    []
  );
};
