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
import { OffersService } from './offers.service.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { OfferActionDto } from './dto/offer-action.dto.js';

@Controller('offers')
@UseGuards(JwtAuthGuard)
export class OffersController {
  constructor(
    private readonly offersService: OffersService,
  ) {}

  @Post()
  create(
    @Req() request: any,
    @Body() dto: CreateOfferDto,
  ) {
    return this.offersService.createOffer(
      request.user.userId,
      dto,
    );
  }

  @Get('listing/:listingId')
  getListingOffers(
    @Req() request: any,
    @Param('listingId') listingId: string,
  ) {
    return this.offersService.getListingOffers(
      listingId,
      request.user.userId,
    );
  }

  @Get('my')
  getMyOffers(@Req() request: any) {
    return this.offersService.getBuyerOffers(
      request.user.userId,
    );
  }

  @Post(':id/accept')
  accept(
    @Req() request: any,
    @Param('id') offerId: string,
  ) {
    return this.offersService.acceptOffer(
      request.user.userId,
      offerId,
    );
  }

  @Post(':id/reject')
  reject(
    @Req() request: any,
    @Param('id') offerId: string,
  ) {
    return this.offersService.rejectOffer(
      request.user.userId,
      offerId,
    );
  }

  @Post(':id/counter')
  counter(
    @Req() request: any,
    @Param('id') offerId: string,
    @Body() dto: OfferActionDto,
  ) {
    return this.offersService.counterOffer(
      request.user.userId,
      offerId,
      dto,
    );
  }
}
