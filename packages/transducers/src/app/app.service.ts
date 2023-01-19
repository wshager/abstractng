import { Injectable } from '@nestjs/common';
import { transduceArray } from './transducers/transducers';

@Injectable()
export class AppService {
  getData(): { message: string; result: number[] } {
    const result = transduceArray([1, 2, 3, 4, 5, 6]);
    return { message: 'Welcome to transducers!', result };
  }
}
