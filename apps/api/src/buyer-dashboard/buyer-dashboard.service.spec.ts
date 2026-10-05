import { Test, TestingModule } from '@nestjs/testing';
import { BuyerDashboardService } from './buyer-dashboard.service.js';

describe('BuyerDashboardService', () => {
  let service: BuyerDashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BuyerDashboardService],
    }).compile();

    service = module.get<BuyerDashboardService>(BuyerDashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
