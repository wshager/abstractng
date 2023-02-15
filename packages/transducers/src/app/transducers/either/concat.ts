import { either } from 'fp-ts';
import { Either } from 'fp-ts/lib/Either';

export const concat = <E, A>(a: Either<E, A>, c: A) => either.map(() => c)(a);
