import { transducePush } from '../transduce';

export const merge = () => (step) => (a, c) => {
  return transducePush(c, step, a);
};
