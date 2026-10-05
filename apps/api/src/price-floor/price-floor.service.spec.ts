import { Test, TestingModule } from '@nestjs/testing';
import { PriceFloorService } from './price-floor.service.js';

describe('PriceFloorService', () => {
  let service: PriceFloorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PriceFloorService],
    }).compile();

    service = module.get<PriceFloorService>(PriceFloorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
