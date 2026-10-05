import { Test, TestingModule } from '@nestjs/testing';
import { FarmerDashboardController } from './farmer-dashboard.controller.js';

describe('FarmerDashboardController', () => {
  let controller: FarmerDashboardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FarmerDashboardController],
    }).compile();

    controller = module.get<FarmerDashboardController>(FarmerDashboardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
