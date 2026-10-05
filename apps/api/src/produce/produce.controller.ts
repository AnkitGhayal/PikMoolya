import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ProduceService } from './produce.service.js';
import { CreateProduceListingDto } from './dto/create-produce-listing.dto.js';
import { UpdateProduceListingDto } from './dto/update-produce-listing.dto.js';

@Controller('produce')
@UseGuards(JwtAuthGuard)
export class ProduceController {
  constructor(
    private readonly produceService: ProduceService,
  ) {}

  @Post()
  async create(
    @Req() request: any,
    @Body() dto: CreateProduceListingDto,
  ) {
    return this.produceService.createListing(
      request.user.userId,
      dto,
    );
  }

  @Get()
  async findMyListings(@Req() request: any) {
    return this.produceService.getMyListings(
      request.user.userId,
    );
  }

  @Get(':id')
  async findOne(
    @Req() request: any,
    @Param('id') listingId: string,
  ) {
    return this.produceService.getListing(
      request.user.userId,
      listingId,
    );
  }

  @Patch(':id')
  async update(
    @Req() request: any,
    @Param('id') listingId: string,
    @Body() dto: UpdateProduceListingDto,
  ) {
    return this.produceService.updateListing(
      request.user.userId,
      listingId,
      dto,
    );
  }

  @Post(':id/publish')
  async publish(
    @Req() request: any,
    @Param('id') listingId: string,
  ) {
    return this.produceService.publishListing(
      request.user.userId,
      listingId,
    );
  }

  @Post(':id/cancel')
  async cancel(
    @Req() request: any,
    @Param('id') listingId: string,
  ) {
    return this.produceService.cancelListing(
      request.user.userId,
      listingId,
    );
  }

  @Get(':id/fair-price')
  async calculateListingFairPrice(
    @Req() request: any,
    @Param('id') listingId: string,
  ) {
    return this.produceService.calculateListingFairPrice(
      request.user.userId,
      listingId,
    );
  }

  @Get(':id/decision')
  async calculateListingDecision(
    @Req() request: any,
    @Param('id') listingId: string,
  ) {
    return this.produceService.calculateListingDecision(
      request.user.userId,
      listingId,
    );
  }

  @Get(':id/price-floor')
  async calculateListingPriceFloor(
    @Req() request: any,
    @Param('id') listingId: string,
  ) {
    return this.produceService.calculateListingPriceFloor(
      request.user.userId,
      listingId,
    );
  }
}


