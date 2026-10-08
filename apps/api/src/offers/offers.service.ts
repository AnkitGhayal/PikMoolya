import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Offer } from './entities/offer.entity.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { OfferActionDto } from './dto/offer-action.dto.js';
import { ProduceListing } from '../produce/entities/produce-listing.entity.js';
import { NegotiationsService } from '../negotiations/negotiations.service.js';
import { Negotiation } from '../negotiations/entities/negotiation.entity.js';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,

    @InjectRepository(ProduceListing)
    private readonly listingRepository: Repository<ProduceListing>,

    @InjectRepository(Negotiation)
    private readonly negotiationRepository: Repository<Negotiation>,

    private readonly negotiationsService: NegotiationsService,
  ) {}

  async createOffer(
    buyerId: string,
    dto: CreateOfferDto,
  ) {
    const listing = await this.listingRepository.findOne({
      where: {
        id: dto.listingId,
      },
    });

    if (!listing) {
      throw new NotFoundException(
        'Produce listing not found',
      );
    }

    if (String(listing.status) !== 'PUBLISHED') {
      throw new BadRequestException(
        'Offers can only be placed on published listings',
      );
    }

    if (listing.farmerId === buyerId) {
      throw new BadRequestException(
        'A farmer cannot place an offer on their own listing',
      );
    }

    const transport = Number(
      dto.transportCostPerUnit ?? 0,
    );

    const platformFee = Number(
      dto.platformFeePerUnit ?? 0,
    );

    const risk = Number(
      dto.estimatedRiskCostPerUnit ?? 0,
    );

    const effectiveNet =
      Number(dto.offeredPricePerUnit) -
      transport -
      platformFee -
      risk;

    const negotiation =
      await this.negotiationsService.analyzeOffer(
        listing.farmerId,
        {
          listingId: dto.listingId,
          offerPricePerUnit:
            Number(dto.offeredPricePerUnit),
          buyerTransportCostPerUnit: transport,
          buyerRiskCostPerUnit: risk,
        },
      );

    const savedOffer =
      await this.offerRepository.save(
        this.offerRepository.create({
          listingId: dto.listingId,
          buyerId,
          auctionId: dto.auctionId ?? null,
          quantity: dto.quantity ? Number(dto.quantity) : Number(listing.quantity),
          offeredPricePerUnit:
            Number(dto.offeredPricePerUnit),
          transportCostPerUnit: transport,
          platformFeePerUnit: platformFee,
          estimatedRiskCostPerUnit: risk,
          deliveryTerms: dto.deliveryTerms ?? null,
          paymentTerms: dto.paymentTerms ?? null,
          effectiveNetPerUnit: Number(
            effectiveNet.toFixed(2),
          ),
          status: 'PENDING',
          expiresAt: dto.expiresAt
            ? new Date(dto.expiresAt)
            : null,
        }),
      );

    return {
      offer: savedOffer,
      negotiation: {
        decision:
          negotiation.negotiation.decision,
        suggestedCounterOffer:
          negotiation.negotiation
            .suggestedCounterOffer,
        reason:
          negotiation.negotiation.reason,
        farmerMessage:
          negotiation.negotiation.farmerMessage,
      },
      referencePrices:
        negotiation.referencePrices,
      comparison:
        negotiation.comparison,
      calculation: {
        offeredPricePerUnit:
          Number(dto.offeredPricePerUnit),
        transportCostPerUnit: transport,
        platformFeePerUnit: platformFee,
        estimatedRiskCostPerUnit: risk,
        effectiveNetPerUnit: Number(
          effectiveNet.toFixed(2),
        ),
      },
      explanation:
        negotiation.explanation,
      dataType:
        'AI_ASSISTED_OFFER_ANALYSIS',
      disclaimer:
        'AI recommendation, not a guaranteed outcome. The farmer makes the final selling decision.',
    };
  }

  async getListingOffers(
    listingId: string,
    farmerId: string,
  ) {
    const listing =
      await this.listingRepository.findOne({
        where: {
          id: listingId,
          farmerId,
        },
      });

    if (!listing) {
      throw new NotFoundException(
        'Produce listing not found',
      );
    }

    const offers =
      await this.offerRepository.find({
        where: {
          listingId,
        },
        order: {
          effectiveNetPerUnit: 'DESC',
          createdAt: 'DESC',
        },
      });

    const analyzedOffers = offers.map((offer) => {
      const effectiveNet = Number(
        offer.effectiveNetPerUnit ?? 0,
      );

      const offeredPrice = Number(
        offer.offeredPricePerUnit,
      );

      return {
        ...offer,
        effectiveNetPerUnit: effectiveNet,
        ranking: {
          rawPrice: offeredPrice,
          effectiveNet,
          rankBasis:
            'EFFECTIVE_NET_VALUE',
        },
      };
    });

    return {
      listingId,
      crop: listing.crop,
      quantity: listing.quantity,
      unit: listing.unit,
      offers: analyzedOffers,
      bestOffer:
        analyzedOffers[0] ?? null,
      offerCount: analyzedOffers.length,
      methodology:
        'Offers are ranked by effective net value after buyer-side transport, platform and estimated risk costs.',
    };
  }

  async getBuyerOffers(
    buyerId: string,
  ) {
    const offers =
      await this.offerRepository.find({
        where: {
          buyerId,
        },
        order: {
          createdAt: 'DESC',
        },
      });

    return {
      buyerId,
      offers,
      offerCount: offers.length,
    };
  }

  async acceptOffer(
    farmerId: string,
    offerId: string,
  ) {
    const offer =
      await this.findFarmerOffer(
        farmerId,
        offerId,
      );

    if (!['PENDING', 'COUNTERED'].includes(offer.status)) {
      throw new BadRequestException('Only active offers can be accepted');
    }

    offer.status = 'ACCEPTED';

    const saved = await this.offerRepository.save(offer);
    await this.negotiationRepository.save(this.negotiationRepository.create({ offerId: offer.id, actorUserId: farmerId, action: 'ACCEPT', pricePerUnit: Number(offer.offeredPricePerUnit), message: 'Offer accepted by farmer.', aiSuggested: false }));

    return {
      offer: saved,
      action: 'ACCEPTED',
      message:
        'Offer accepted. The transaction can now proceed to order creation.',
    };
  }

  async rejectOffer(
    farmerId: string,
    offerId: string,
  ) {
    const offer =
      await this.findFarmerOffer(
        farmerId,
        offerId,
      );

    if (!['PENDING', 'COUNTERED'].includes(offer.status)) {
      throw new BadRequestException('Only active offers can be rejected');
    }

    offer.status = 'REJECTED';

    const saved = await this.offerRepository.save(offer);
    await this.negotiationRepository.save(this.negotiationRepository.create({ offerId: offer.id, actorUserId: farmerId, action: 'REJECT', pricePerUnit: Number(offer.offeredPricePerUnit), message: 'Offer rejected by farmer.', aiSuggested: false }));

    return {
      offer: saved,
      action: 'REJECTED',
      message:
        'Offer rejected by the farmer.',
    };
  }

  async counterOffer(
    farmerId: string,
    offerId: string,
    dto: OfferActionDto,
  ) {
    if (
      dto.counterPricePerUnit === undefined
    ) {
      throw new BadRequestException(
        'counterPricePerUnit is required for a counter offer',
      );
    }

    const offer =
      await this.findFarmerOffer(
        farmerId,
        offerId,
      );

    if (!['PENDING', 'COUNTERED'].includes(offer.status)) {
      throw new BadRequestException('Only active offers can be countered');
    }

    const counterPrice =
      Number(dto.counterPricePerUnit);

    offer.offeredPricePerUnit = counterPrice;
    offer.quantity = dto.quantity !== undefined ? Number(dto.quantity) : offer.quantity;

    offer.effectiveNetPerUnit =
      Number(
        (
          counterPrice -
          Number(
            offer.transportCostPerUnit ?? 0,
          ) -
          Number(
            offer.platformFeePerUnit ?? 0,
          ) -
          Number(
            offer.estimatedRiskCostPerUnit ?? 0,
          )
        ).toFixed(2),
      );

    offer.status = 'COUNTERED';

    const saved = await this.offerRepository.save(offer);
    await this.negotiationRepository.save(this.negotiationRepository.create({ offerId: offer.id, actorUserId: farmerId, action: 'COUNTER', pricePerUnit: counterPrice, message: dto.message ?? 'Farmer submitted a counter offer.', aiSuggested: false }));

    return {
      offer: saved,
      action: 'COUNTERED',
      counterPricePerUnit: counterPrice,
      message:
        dto.message ??
        'Farmer has submitted a counter offer.',
      disclaimer:
        'The counter offer is a negotiation action, not a guaranteed transaction.',
    };
  }

  private async findFarmerOffer(
    farmerId: string,
    offerId: string,
  ) {
    const offer =
      await this.offerRepository.findOne({
        where: {
          id: offerId,
        },
      });

    if (!offer) {
      throw new NotFoundException(
        'Offer not found',
      );
    }

    const listing =
      await this.listingRepository.findOne({
        where: {
          id: offer.listingId,
          farmerId,
        },
      });

    if (!listing) {
      throw new NotFoundException(
        'Offer does not belong to this farmer',
      );
    }

    return offer;
  }
}
