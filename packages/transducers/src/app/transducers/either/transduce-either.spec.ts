import { either } from 'fp-ts';
import { hello } from '../testing/hello';
import { transduceEitherPull } from './transduce-either';

describe('Transduce Either', () => {
  it('should return "hello world"', () => {
    const concat = (acc: string, cur: string) => `${acc} ${cur}`;

    const result = either.reduce('hello', concat)(either.right('world'));

    expect(result).toBe('hello world');
  });

  it('should return a right either with value "hello world"', () => {
    const result = transduceEitherPull(either.right('world'), hello);

    expect(either.isRight(result)).toBeTruthy();
    expect(either.toUnion(result)).toBe('hello world');
  });

  it('should NOT return a right either with value "hello world"', () => {
    const result = transduceEitherPull(either.left('error'), hello);

    expect(either.isRight(result)).toBeFalsy();
    expect(either.toUnion(result)).toBe('error');
  });
});
