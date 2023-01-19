import { Test, TestingModule } from '@nestjs/testing';

import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let app: TestingModule;
  let appController: AppController;
  let getDataSpy: jest.SpyInstance;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get(AppController);

    const service = await app.get(AppService);
    getDataSpy = jest.spyOn(service, 'getData');
  });

  describe('getData', () => {
    it('should return "Welcome to transducers!"', () => {
      const response = {};
      getDataSpy.mockReturnValue(response);

      const result = appController.getData();

      expect(result).toBe(response);
      expect(getDataSpy).toHaveBeenCalled();
    });
  });
});
