import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProduceListing } from '../produce/entities/produce-listing.entity.js';
import { Auction } from '../auctions/entities/auction.entity.js';
import { AuctionBid } from '../auctions/entities/auction-bid.entity.js';
import { BuyerMatchingService } from '../buyer-matching/buyer-matching.service.js';

@Injectable()
export class BuyerDashboardService {
  constructor(
    @InjectRepository(ProduceListing)
    private readonly listingRepository: Repository<ProduceListing>,

    @InjectRepository(Auction)
    private readonly auctionRepository: Repository<Auction>,

    @InjectRepository(AuctionBid)
    private readonly auctionBidRepository: Repository<AuctionBid>,

    private readonly buyerMatchingService: BuyerMatchingService,
  ) {}

  async getDashboard(userId: string) {
    const listings = await this.listingRepository.find({
      where: {
        status: 'PUBLISHED' as any,
      },
      order: {
        createdAt: 'DESC',
      },
      take: 20,
    });

    const activeAuctions = await this.auctionRepository.find({
      where: {
        status: 'ACTIVE' as any,
      },
      order: {
        endsAt: 'ASC',
      },
    });

    const produce = [];

    for (const listing of listings) {
      let buyerMatches: any[] = [];

      if (listing.crop?.id) {
        const matchingResult =
          await this.buyerMatchingService.matchBuyers({
            cropId: listing.crop.id,
            quantity: Number(listing.quantity),
          });

        buyerMatches = matchingResult.buyers.slice(0, 5);
      }

      produce.push({
        listingId: listing.id,
        farmerId: listing.farmerId,
        crop: listing.crop,
        quantity: listing.quantity,
        unit: listing.unit,
        location: listing.locationName,
        harvestDate: listing.harvestDate,
        status: listing.status,

        quality: {
          score: null,
          grade: null,
          verified: false,
          message:
            'Quality verification is not available for this listing yet.',
        },

        buyerMatching: {
          matches: buyerMatches,
          topMatch: buyerMatches[0] ?? null,
        },
      });
    }

    const auctions = [];

    for (const auction of activeAuctions) {
      const bids = await this.auctionBidRepository.find({
        where: {
          auctionId: auction.id,
        },
        order: {
          effectiveNetPerUnit: 'DESC',
        },
      });

      const bestBid = bids[0] ?? null;

      const listing = listings.find(
        (item) => item.id === auction.listingId,
      );

      auctions.push({
        auctionId: auction.id,
        listingId: auction.listingId,
        crop: listing?.crop ?? null,
        quantity: listing?.quantity ?? null,
        unit: listing?.unit ?? null,
        startsAt: auction.startsAt,
        endsAt: auction.endsAt,
        minimumBidPerUnit: auction.minimumBidPerUnit,
        bidCount: bids.length,
        bestEffectiveNetPerUnit:
          bestBid?.effectiveNetPerUnit ?? null,
        competitionStatus:
          bids.length === 0
            ? 'WAITING_FOR_BIDS'
            : 'BIDS_AVAILABLE',
      });
    }

    const allMatches = produce
      .flatMap((item: any) => item.buyerMatching.matches)
      .sort(
        (a: any, b: any) => b.matchScore - a.matchScore,
      );

    return {
      buyerId: userId,

      summary: {
        availableProduce: produce.length,
        verifiedQualityListings: 0,
        activeOffers: 0,
        activeAuctions: auctions.length,
      },

      produce,

      recommendations: produce.slice(0, 5).map((item: any) => ({
        listingId: item.listingId,
        crop: item.crop,
        reason: 'Recommended from currently published produce.',
        matchScore:
          item.buyerMatching.topMatch?.matchScore ?? null,
      })),

      buyerMatching: {
        topMatches: allMatches.slice(0, 10),
        methodology: {
          buyerReliability: '40%',
          qualityMatch: '35%',
          distance: '25%',
        },
        dataType: 'DEMO_BUYER_MATCHING',
      },

      quality: {
        verifiedListings: [],
        methodology:
          'Quality scores will come from the PikMoolya AI-assisted quality verification service.',
      },

      competition: {
        activeAuctions: auctions,
        bestDeals: [],
      },

      explanation:
        'Buyer dashboard combines published produce, buyer matching and active PikMoolya auctions. Buyer matching currently uses the existing demo reliability, quality and distance scoring model.',

      disclaimer:
        'AI recommendations are not guaranteed outcomes. Verify produce quality, quantity, logistics and transaction terms before purchase.',

      dataType: 'CURRENT_BACKEND_DATA_WITH_DEMO_MATCHING',
    };
  }
}
