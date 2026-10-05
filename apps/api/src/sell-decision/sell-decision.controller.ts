import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { SellDecisionDto } from './dto/sell-decision.dto.js';
import { SellDecisionService } from './sell-decision.service.js';

@Controller('sell-decision')
@UseGuards(JwtAuthGuard)
export class SellDecisionController {
  constructor(
    private readonly sellDecisionService: SellDecisionService,
  ) {}

  @Post('calculate')
  calculate(@Body() dto: SellDecisionDto) {
    return this.sellDecisionService.calculate(dto);
  }
}
