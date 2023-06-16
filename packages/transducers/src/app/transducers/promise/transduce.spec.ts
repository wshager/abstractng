import { hello } from '../testing/hello';
import { transducePromise } from './transduce';

describe('Transduce Promise', () => {
  const reducePromise = async (p, f, init) => {
    return f(init, await p);
  };
  it('should return "hello world"', async () => {
    const concat = (acc: string, cur: string) => `${acc} ${cur}`;

    const result = await reducePromise(
      Promise.resolve('world'),
      concat,
      'hello'
    );

    expect(result).toBe('hello world');
  });

  it('should throw', async () => {
    const concat = (acc: string, cur: string) => `${acc} ${cur}`;

    reducePromise(Promise.reject('world'), concat, 'hello').catch((error) => {
      expect(error).toBe('world');
    });
  });

  it('should return a promise that contains "hello world"', async () => {
    const result = transducePromise(Promise.resolve('world'), hello);

    expect(await result).toBe('hello world');
  });

  it('should return a reject promise', () => {
    const result = transducePromise(Promise.reject('err'), hello);

    expect(result).rejects.toBeTruthy();
  });
});
