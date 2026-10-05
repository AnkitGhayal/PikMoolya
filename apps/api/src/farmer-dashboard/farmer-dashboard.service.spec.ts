import { Test, TestingModule } from '@nestjs/testing';
import { FarmerDashboardService } from './farmer-dashboard.service.js';

describe('FarmerDashboardService', () => {
  let service: FarmerDashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FarmerDashboardService],
    }).compile();

    service = module.get<FarmerDashboardService>(FarmerDashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
