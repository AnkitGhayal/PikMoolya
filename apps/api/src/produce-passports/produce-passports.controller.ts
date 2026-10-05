import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ProducePassportsService } from './produce-passports.service.js';
import { CreateProducePassportDto } from './dto/create-produce-passport.dto.js';

@Controller('produce-passports')
@UseGuards(JwtAuthGuard)
export class ProducePassportsController {
  constructor(
    private readonly producePassportsService: ProducePassportsService,
  ) {}

  @Get('by-listing/:listingId')
  getByListing(
    @Req() request: any,
    @Param('listingId') listingId: string,
  ) {
    return this.producePassportsService.getPassportByListingId(
      request.user.userId,
      listingId,
    );
  }

  @Post()
  create(
    @Req() request: any,
    @Body() dto: CreateProducePassportDto,
  ) {
    return this.producePassportsService.createPassport(
      request.user.userId,
      dto,
    );
  }
}
