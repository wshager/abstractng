import { Either } from 'fp-ts/Either';
import { transducePull } from '../transduce';
import { concat } from './concat';
import { generator } from './generator';

export const transduceEitherPull = <E, A>(
  input: Either<E, A>,
  fn
): Either<E, A> => transducePull(input, fn(concat), generator, input);
