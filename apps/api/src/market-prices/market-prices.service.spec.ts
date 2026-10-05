import { Test, TestingModule } from '@nestjs/testing';
import { MarketPricesService } from './market-prices.service.js';

describe('MarketPricesService', () => {
  let service: MarketPricesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MarketPricesService],
    }).compile();

    service = module.get<MarketPricesService>(MarketPricesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
