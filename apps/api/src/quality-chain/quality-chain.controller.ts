import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { QualityChainCheckDto } from './dto/quality-chain-check.dto.js';
import { QualityChainService } from './quality-chain.service.js';

@Controller('quality-chain')
@UseGuards(JwtAuthGuard)
export class QualityChainController {
  constructor(
    private readonly qualityChainService: QualityChainService,
  ) {}

  @Post('check')
  recordCheck(
    @Req() request: any,
    @Body() dto: QualityChainCheckDto,
  ) {
    return this.qualityChainService.recordCheck(
      request.user.userId,
      dto,
    );
  }
}
