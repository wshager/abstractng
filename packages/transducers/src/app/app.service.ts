import { Injectable } from '@nestjs/common';
import { compose, filter, map } from './transducers';
import { transduceArray } from './transducers/array';

@Injectable()
export class AppService {
  getData(): { message: string; result: number[] } {
    const isEven = (n) => n % 2 === 0;
    const double = (n) => n * 2;
    const doubleEvens = compose(filter(isEven), map(double));

    const result = transduceArray([1, 2, 3, 4, 5, 6], doubleEvens);
    return { message: 'Welcome to transducers!', result };
  }
}
