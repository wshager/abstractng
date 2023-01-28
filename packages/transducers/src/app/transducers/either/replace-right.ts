import { either } from 'fp-ts';
import { Either } from 'fp-ts/lib/Either';

export const replaceRight = <E, A>(a: Either<E, A>, c: A) =>
  either.map(() => c)(a);
