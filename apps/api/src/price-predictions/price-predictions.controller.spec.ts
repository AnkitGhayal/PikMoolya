import { Test, TestingModule } from '@nestjs/testing';
import { PricePredictionsController } from './price-predictions.controller.js';

describe('PricePredictionsController', () => {
  let controller: PricePredictionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PricePredictionsController],
    }).compile();

    controller = module.get<PricePredictionsController>(PricePredictionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
