import { either } from 'fp-ts';
import { Either } from 'fp-ts/lib/Either';
import { identity } from 'rxjs';

export function* generator<E, A>(input: Either<E, A>) {
  yield either.fold(identity, identity)(input);
}
