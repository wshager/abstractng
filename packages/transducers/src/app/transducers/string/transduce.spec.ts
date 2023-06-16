import { compose, filter, map } from '..';
import { prependHello } from '../testing/prepend-hello';
import { transduceString, transduceStringPull } from './transduce';

const isW = (a: string) => a === 'w';
const hello = compose(filter(isW), map(prependHello));

describe('Transduce string', () => {
  it('should return hello w', () => {
    const result = transduceString('world', hello);

    expect(result).toEqual('hello w');
  });
});

describe('Transduce string pull', () => {
  it('should return hello w', () => {
    const result = transduceStringPull('world', hello);

    expect(result).toEqual('hello w');
  });
});
