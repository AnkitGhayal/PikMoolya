import { Test, TestingModule } from '@nestjs/testing';
import { PricePredictionsService } from './price-predictions.service.js';

describe('PricePredictionsService', () => {
  let service: PricePredictionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PricePredictionsService],
    }).compile();

    service = module.get<PricePredictionsService>(PricePredictionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
