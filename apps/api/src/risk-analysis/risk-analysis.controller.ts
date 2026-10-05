import {
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RiskAnalysisService } from './risk-analysis.service.js';
import { AnalyzeRiskDto } from './dto/analyze-risk.dto.js';

@Controller('risk-analysis')
@UseGuards(JwtAuthGuard)
export class RiskAnalysisController {
  constructor(
    private readonly riskAnalysisService: RiskAnalysisService,
  ) {}

  @Post('analyze')
  analyze(@Body() dto: AnalyzeRiskDto) {
    return this.riskAnalysisService.analyze(dto);
  }
}
