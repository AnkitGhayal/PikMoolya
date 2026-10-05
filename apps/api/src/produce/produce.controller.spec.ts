import { Test, TestingModule } from '@nestjs/testing';
import { ProduceController } from './produce.controller.js';

describe('ProduceController', () => {
  let controller: ProduceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProduceController],
    }).compile();

    controller = module.get<ProduceController>(ProduceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
