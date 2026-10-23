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
    const userId = request.user?.userId || request.user?.id;
    return this.offersService.createOffer(
      userId,
      dto,
    );
  }

  @Get('farmer/all')
  getFarmerOffers(@Req() request: any) {
    const userId = request.user?.userId || request.user?.id;
    return this.offersService.getFarmerOffers(userId);
  }

  @Get('listing/:listingId')
  getListingOffers(
    @Req() request: any,
    @Param('listingId') listingId: string,
  ) {
    const userId = request.user?.userId || request.user?.id;
    return this.offersService.getListingOffers(
      listingId,
      userId,
    );
  }

  @Get('my')
  getMyOffers(@Req() request: any) {
    const userId = request.user?.userId || request.user?.id;
    return this.offersService.getBuyerOffers(userId);
  }

  @Post(':id/accept')
  accept(
    @Req() request: any,
    @Param('id') offerId: string,
    @Body() dto?: OfferActionDto,
  ) {
    const userId = request.user?.userId || request.user?.id;
    return this.offersService.acceptOffer(
      userId,
      offerId,
      dto,
    );
  }

  @Post(':id/reject')
  reject(
    @Req() request: any,
    @Param('id') offerId: string,
  ) {
    const userId = request.user?.userId || request.user?.id;
    return this.offersService.rejectOffer(
      userId,
      offerId,
    );
  }

  @Post(':id/counter')
  counter(
    @Req() request: any,
    @Param('id') offerId: string,
    @Body() dto: OfferActionDto,
  ) {
    const userId = request.user?.userId || request.user?.id;
    return this.offersService.counterOffer(
      userId,
      offerId,
      dto,
    );
  }

  @Post(':id/withdraw')
  withdraw(
    @Req() request: any,
    @Param('id') offerId: string,
  ) {
    const userId = request.user?.userId || request.user?.id;
    return this.offersService.withdrawOffer(
      userId,
      offerId,
    );
  }

  @Get(':id/history')
  getOfferHistory(
    @Req() request: any,
    @Param('id') offerId: string,
  ) {
    const userId = request.user?.userId || request.user?.id;
    return this.offersService.getOfferHistory(
      userId,
      offerId,
    );
  }
}
