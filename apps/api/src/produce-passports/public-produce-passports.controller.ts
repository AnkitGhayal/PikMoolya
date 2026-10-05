import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';

import { ProducePassportsService } from './produce-passports.service.js';

@Controller('public/produce-passports')
export class PublicProducePassportsController {
  constructor(
    private readonly producePassportsService: ProducePassportsService,
  ) {}

  @Get(':lotId')
  findByLotId(
    @Param('lotId') lotId: string,
  ) {
    return this.producePassportsService.getPassportByLotId(lotId);
  }
}

