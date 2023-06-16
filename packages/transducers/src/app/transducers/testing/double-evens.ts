import { compose, filter, map } from '..';
import { double } from './double';
import { isEven } from './is-even';

export const doubleEvens = compose(filter(isEven), map(double));
