import { Test, TestingModule } from '@nestjs/testing';
import { MarketPricesController } from './market-prices.controller.js';

describe('MarketPricesController', () => {
  let controller: MarketPricesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarketPricesController],
    }).compile();

    controller = module.get<MarketPricesController>(MarketPricesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
