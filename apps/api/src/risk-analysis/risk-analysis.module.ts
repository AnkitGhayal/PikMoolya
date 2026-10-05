import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { RiskAnalysisController } from './risk-analysis.controller.js';
import { RiskAnalysisService } from './risk-analysis.service.js';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
  ],
  controllers: [RiskAnalysisController],
  providers: [RiskAnalysisService],
})
export class RiskAnalysisModule {}
