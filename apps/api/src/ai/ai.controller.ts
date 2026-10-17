import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AiService } from './ai.service.js';
import { PricePredictionInputDto, QualityAssessmentInputDto } from './dto/ai-input.dto.js';

@ApiTags('AI Services')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('price-prediction')
  @ApiOperation({ summary: 'Predict estimated fair price based on Pf = f(C, L, Q, M, H)' })
  async predictPrice(@Body() dto: PricePredictionInputDto) {
    return this.aiService.predictPrice(dto);
  }

  @Post('quality-assessment')
  @ApiOperation({ summary: 'Assess crop image visual quality using computer vision pipeline' })
  async assessQuality(@Body() dto: QualityAssessmentInputDto) {
    return this.aiService.assessQuality(dto);
  }
}
