import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { AnalyzeOfferDto } from './dto/analyze-offer.dto.js';
import { NegotiationsService } from './negotiations.service.js';

@Controller('negotiations')
@UseGuards(JwtAuthGuard)
export class NegotiationsController {
  constructor(
    private readonly negotiationsService: NegotiationsService,
  ) {}

  @Post('analyze-offer')
  analyzeOffer(
    @Req() request: any,
    @Body() dto: AnalyzeOfferDto,
  ) {
    return this.negotiationsService.analyzeOffer(
      request.user.userId,
      dto,
    );
  }
}
