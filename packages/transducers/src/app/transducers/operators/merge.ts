export const merge = (transduce) => (step) => (a, c) => transduce(c, step, a);
