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
import { AuctionsService } from './auctions.service.js';
import { CreateAuctionDto } from './dto/create-auction.dto.js';
import { PlaceBidDto } from './dto/place-bid.dto.js';

@Controller('auctions')
@UseGuards(JwtAuthGuard)
export class AuctionsController {
  constructor(
    private readonly auctionsService: AuctionsService,
  ) {}

  @Post()
  create(
    @Req() request: any,
    @Body() dto: CreateAuctionDto,
  ) {
    return this.auctionsService.createAuction(
      request.user.userId,
      dto,
    );
  }

  @Post(':id/bids')
  placeBid(
    @Param('id') auctionId: string,
    @Body() dto: PlaceBidDto,
  ) {
    return this.auctionsService.placeBid(
      auctionId,
      dto,
    );
  }

  @Get(':id')
  getAuction(@Param('id') auctionId: string) {
    return this.auctionsService.getAuction(auctionId);
  }

  @Get(':id/ranking')
  getRanking(@Param('id') auctionId: string) {
    return this.auctionsService.getAuction(auctionId);
  }

  @Get(':id/competition')
  getCompetition(@Param('id') auctionId: string) {
    return this.auctionsService.getAuction(auctionId);
  }
}
