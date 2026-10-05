import {
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

import { CalculateFairPriceDto } from './dto/calculate-fair-price.dto.js';
import { FairPriceService } from './fair-price.service.js';

@Controller('fair-price')
@UseGuards(JwtAuthGuard)
export class FairPriceController {
  constructor(
    private readonly fairPriceService: FairPriceService,
  ) {}

  @Post('calculate')
  calculate(
    @Body() dto: CalculateFairPriceDto,
  ) {
    return this.fairPriceService.calculateFairPrice(dto);
  }
}
