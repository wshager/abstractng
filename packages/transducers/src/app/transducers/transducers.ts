import { array, compose, filter, map, transduce } from '.';

export const transduceArray = (input: number[]) => {
  const isEven = (n) => n % 2 === 0;
  const double = (n) => n * 2;
  const doubleEvens = compose(filter(isEven), map(double));

  const xform = doubleEvens(array.concat);

  return transduce(input, xform, array.generator, []);
};
