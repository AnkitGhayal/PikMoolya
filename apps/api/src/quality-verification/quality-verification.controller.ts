import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { AssessQualityDto } from './dto/assess-quality.dto.js';
import { QualityVerificationService } from './quality-verification.service.js';

@Controller('quality-verification')
@UseGuards(JwtAuthGuard)
export class QualityVerificationController {
  constructor(
    private readonly qualityVerificationService: QualityVerificationService,
  ) {}

  @Post('assess')
  assess(
    @Req() request: any,
    @Body() dto: AssessQualityDto,
  ) {
    return this.qualityVerificationService.assessQuality(
      request.user.userId,
      dto,
    );
  }
}
