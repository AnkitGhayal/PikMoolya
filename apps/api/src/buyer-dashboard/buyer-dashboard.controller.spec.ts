import { Test, TestingModule } from '@nestjs/testing';
import { BuyerDashboardController } from './buyer-dashboard.controller.js';

describe('BuyerDashboardController', () => {
  let controller: BuyerDashboardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BuyerDashboardController],
    }).compile();

    controller = module.get<BuyerDashboardController>(BuyerDashboardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
