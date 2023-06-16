import { compose, filter, map } from '..';
import { isWorld } from './is-world';
import { prependHello } from './prepend-hello';

export const hello = compose(filter(isWorld), map(prependHello));
