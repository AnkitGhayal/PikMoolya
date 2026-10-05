import { Test, TestingModule } from '@nestjs/testing';
import { PriceFloorController } from './price-floor.controller.js';

describe('PriceFloorController', () => {
  let controller: PriceFloorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PriceFloorController],
    }).compile();

    controller = module.get<PriceFloorController>(PriceFloorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
