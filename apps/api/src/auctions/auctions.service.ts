import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProduceListing } from '../produce/entities/produce-listing.entity.js';
import { User } from '../users/entities/user.entity.js';
import {
  Auction,
  AuctionStatus,
} from './entities/auction.entity.js';
import { AuctionBid } from './entities/auction-bid.entity.js';
import { CreateAuctionDto } from './dto/create-auction.dto.js';
import { PlaceBidDto } from './dto/place-bid.dto.js';

@Injectable()
export class AuctionsService {
  constructor(
    @InjectRepository(ProduceListing)
    private readonly listingRepository: Repository<ProduceListing>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Auction)
    private readonly auctionRepository: Repository<Auction>,

    @InjectRepository(AuctionBid)
    private readonly bidRepository: Repository<AuctionBid>,
  ) {}

  async createAuction(
    userId: string,
    dto: CreateAuctionDto,
  ) {
    const listing = await this.listingRepository.findOne({
      where: {
        id: dto.listingId,
        farmerId: userId,
      },
    });

    if (!listing) {
      throw new NotFoundException(
        'Produce listing not found',
      );
    }

    if (listing.status !== 'PUBLISHED') {
      throw new BadRequestException(
        'Only published produce listings can be auctioned',
      );
    }

    const startsAt = new Date();

    const endsAt = new Date(
      startsAt.getTime() +
        Number(dto.durationMinutes) * 60 * 1000,
    );

    const auction = this.auctionRepository.create({
      listingId: listing.id,
      createdBy: userId,
      status: AuctionStatus.ACTIVE,
      startsAt,
      endsAt,
      minimumBidPerUnit:
        dto.minimumPricePerUnit ?? null,
    });

    const savedAuction =
      await this.auctionRepository.save(auction);

    return {
      auctionId: savedAuction.id,
      listingId: savedAuction.listingId,
      status: savedAuction.status,
      startsAt: savedAuction.startsAt,
      endsAt: savedAuction.endsAt,
      minimumBidPerUnit:
        savedAuction.minimumBidPerUnit,
      quantity: listing.quantity,
      unit: listing.unit,
      message:
        'Auction created successfully.',
      disclaimer:
        'AI recommendation, not a guaranteed outcome. The farmer remains in control of accepting any bid.',
    };
  }

  async placeBid(
    buyerId: string,
    dto: PlaceBidDto,
  ) {
    const buyer = await this.userRepository.findOne({
      where: {
        id: buyerId,
        role: 'BUYER' as any,
        status: 'ACTIVE' as any,
      },
    });

    if (!buyer) {
      throw new NotFoundException(
        'Active buyer not found',
      );
    }

    const auction =
      await this.auctionRepository.findOne({
        where: {
          id: dto.auctionId,
        },
      });

    if (!auction) {
      throw new NotFoundException(
        'Auction not found',
      );
    }

    if (auction.status !== AuctionStatus.ACTIVE) {
      throw new BadRequestException(
        'Auction is not active',
      );
    }

    if (
      auction.endsAt &&
      auction.endsAt.getTime() <= Date.now()
    ) {
      auction.status = AuctionStatus.CLOSED;
      await this.auctionRepository.save(auction);

      throw new BadRequestException(
        'Auction has already ended',
      );
    }

    if (
      auction.minimumBidPerUnit !== null &&
      Number(dto.pricePerUnit) <
        Number(auction.minimumBidPerUnit)
    ) {
      throw new BadRequestException(
        'Bid must be at least the minimum allowed price per unit.',
      );
    }
    const transportCost =
      Number(dto.transportCostPerUnit ?? 0);

    const riskCost =
      Number(dto.estimatedRiskCostPerUnit ?? 0);

    const effectiveNet =
      Number(dto.pricePerUnit) -
      transportCost -
      riskCost;

    const bid = this.bidRepository.create({
      auctionId: auction.id,
      buyerId,
      bidPerUnit: Number(dto.pricePerUnit),
      transportCostPerUnit: transportCost,
      estimatedRiskCostPerUnit: riskCost,
      effectiveNetPerUnit: Number(
        effectiveNet.toFixed(2),
      ),
    });

    const savedBid =
      await this.bidRepository.save(bid);

    return {
      bidId: savedBid.id,
      auctionId: savedBid.auctionId,
      buyerId: savedBid.buyerId,

      deal: {
        bidPerUnit: savedBid.bidPerUnit,
        transportCostPerUnit:
          savedBid.transportCostPerUnit,
        estimatedRiskCostPerUnit:
          savedBid.estimatedRiskCostPerUnit,
        effectiveNetPerUnit:
          savedBid.effectiveNetPerUnit,
      },

      status: 'BID_PLACED',
      createdAt: savedBid.createdAt,

      explanation:
        'Effective net value subtracts estimated transport and risk costs from the buyer bid.',

      disclaimer:
        'AI recommendation, not a guaranteed outcome. Estimated costs may differ from actual transaction costs.',
    };
  }
  async getAuctionRanking(auctionId: string) {
    const auction =
      await this.auctionRepository.findOne({
        where: {
          id: auctionId,
        },
      });

    if (!auction) {
      throw new NotFoundException(
        'Auction not found',
      );
    }

    const bids = await this.bidRepository.find({
      where: {
        auctionId,
      },
        order: {
          effectiveNetPerUnit: 'DESC',
          createdAt: 'ASC',
        },
      });

    const ranking = bids.map((bid, index) => ({
      rank: index + 1,
      bidId: bid.id,
      buyerId: bid.buyerId,

      bidPerUnit: Number(
        bid.bidPerUnit,
      ),

      transportCostPerUnit: Number(
        bid.transportCostPerUnit ?? 0,
      ),

      estimatedRiskCostPerUnit: Number(
        bid.estimatedRiskCostPerUnit ?? 0,
      ),

      effectiveNetPerUnit: Number(
        bid.effectiveNetPerUnit ??
          bid.bidPerUnit,
      ),

      advantageOverRawBid:
        Number(bid.bidPerUnit) -
        Number(bid.effectiveNetPerUnit ?? bid.bidPerUnit),

      recommendation:
        index === 0
          ? 'BEST_EFFECTIVE_NET_DEAL'
          : 'ALTERNATIVE_DEAL',
    }));

    return {
      auctionId: auction.id,
      status: auction.status,

      ranking,

      bestDeal:
        ranking.length > 0
          ? ranking[0]
          : null,

      decisionRule:
        'Rank buyers by effective net value per unit, not raw bid price.',

      farmerControl:
        'The farmer decides whether to accept, reject or negotiate any offer.',

      disclaimer:
        'AI recommendation, not a guaranteed outcome. Estimated transport and risk costs may differ from actual transaction costs.',
    };
  }
  async getAuction(auctionId: string) {
    const auction =
      await this.auctionRepository.findOne({
        where: {
          id: auctionId,
        },
      });

    if (!auction) {
      throw new NotFoundException(
        'Auction not found',
      );
    }

    const bids = await this.bidRepository.find({
      where: {
        auctionId,
      },
      order: {
        effectiveNetPerUnit: 'DESC',
        createdAt: 'ASC',
      },
    });

    return {
      auction,
      bids,
      bestBid:
        bids.length > 0
          ? bids[0]
          : null,
      disclaimer:
        'The highest bid is not necessarily the best final deal. Compare transport, risk and other costs before accepting.',
    };
  }
}






