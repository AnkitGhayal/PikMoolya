import { Test, TestingModule } from '@nestjs/testing';
import { RiskAnalysisService } from './risk-analysis.service.js';

describe('RiskAnalysisService', () => {
  let service: RiskAnalysisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RiskAnalysisService],
    }).compile();

    service = module.get<RiskAnalysisService>(RiskAnalysisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
