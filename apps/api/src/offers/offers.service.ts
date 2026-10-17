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
import { OrdersService } from '../orders/orders.service.js';
import { LogisticsService } from '../logistics/logistics.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';

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
    private readonly ordersService: OrdersService,
    private readonly logisticsService: LogisticsService,
    private readonly notificationsService: NotificationsService,
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

    const cropName = listing.crop?.name || 'Produce';

    // Notify Farmer
    await this.notificationsService.createNotification({
      userId: listing.farmerId,
      role: 'FARMER',
      title: 'New Offer Received',
      body: `A buyer offered ₹${savedOffer.offeredPricePerUnit}/unit for ${savedOffer.quantity} ${listing.unit} of ${cropName}.`,
      type: 'OFFER_RECEIVED',
      referenceId: savedOffer.id,
    });

    // Notify Buyer
    await this.notificationsService.createNotification({
      userId: buyerId,
      role: 'BUYER',
      title: '✓ Offer Sent Successfully',
      body: `Your offer of ₹${savedOffer.offeredPricePerUnit}/unit for ${cropName} has been sent to the farmer.`,
      type: 'OFFER_SENT',
      referenceId: savedOffer.id,
    });

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

  async getFarmerOffers(farmerId: string) {
    const listings = await this.listingRepository.find({
      where: { farmerId },
    });

    const listingIds = listings.map((l) => l.id);

    if (listingIds.length === 0) {
      return { farmerId, offers: [], offerCount: 0 };
    }

    const offers = await this.offerRepository
      .createQueryBuilder('offer')
      .where('offer.listing_id IN (:...listingIds)', { listingIds })
      .orderBy('offer.created_at', 'DESC')
      .getMany();

    const result = offers.map((offer) => {
      const listing = listings.find((l) => l.id === offer.listingId);
      return {
        ...offer,
        cropName: listing?.crop?.name || 'Produce',
        unit: listing?.unit || 'kg',
      };
    });

    return {
      farmerId,
      offers: result,
      offerCount: result.length,
    };
  }

  async getBuyerOffers(buyerId: string) {
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
    userId: string,
    offerId: string,
  ) {
    const offer = await this.offerRepository.findOne({
      where: { id: offerId },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    const listing = await this.listingRepository.findOne({
      where: { id: offer.listingId },
    });

    if (!listing) {
      throw new NotFoundException('Produce listing not found');
    }

    if (listing.farmerId !== userId && offer.buyerId !== userId) {
      throw new BadRequestException('You are not authorized to accept this offer');
    }

    if (!['PENDING', 'COUNTERED'].includes(offer.status)) {
      throw new BadRequestException('Only active or countered offers can be accepted');
    }

    offer.status = 'ACCEPTED';
    const saved = await this.offerRepository.save(offer);

    await this.negotiationRepository.save(
      this.negotiationRepository.create({
        offerId: offer.id,
        actorUserId: userId,
        action: 'ACCEPT',
        pricePerUnit: Number(offer.offeredPricePerUnit),
        message: 'Offer accepted.',
        aiSuggested: false,
      }),
    );

    // Automatically create Order
    let createdOrderResult: any = null;
    let logisticsRequest: any = null;

    try {
      createdOrderResult = await this.ordersService.createFromAcceptedOffer(userId, offer.id);
      if (createdOrderResult?.order) {
        logisticsRequest = await this.logisticsService.createForOrder(
          createdOrderResult.order,
          listing.crop?.name || 'Produce',
          listing.unit || 'kg',
        );
      }
    } catch (e) {
      // Ignore if order already exists
    }

    const cropName = listing.crop?.name || 'Produce';

    // Notify Farmer & Buyer
    await this.notificationsService.createNotification({
      userId: listing.farmerId,
      role: 'FARMER',
      title: '✓ Offer Confirmed & Order Created',
      body: `Offer of ₹${offer.offeredPricePerUnit}/unit for ${cropName} was accepted. Order created and delivery requested.`,
      type: 'OFFER_ACCEPTED',
      referenceId: offer.id,
    });

    await this.notificationsService.createNotification({
      userId: offer.buyerId,
      role: 'BUYER',
      title: '✓ Counter Offer Accepted & Order Created',
      body: `Your transaction for ${cropName} at ₹${offer.offeredPricePerUnit}/unit is confirmed. Order created and delivery requested.`,
      type: 'OFFER_ACCEPTED',
      referenceId: offer.id,
    });

    return {
      offer: saved,
      order: createdOrderResult?.order ?? null,
      logisticsRequest: logisticsRequest ?? null,
      action: 'ACCEPTED',
      message: '✓ Offer accepted successfully. Order creation and logistics request initiated.',
    };
  }

  async rejectOffer(
    userId: string,
    offerId: string,
  ) {
    const offer = await this.offerRepository.findOne({
      where: { id: offerId },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    if (!['PENDING', 'COUNTERED'].includes(offer.status)) {
      throw new BadRequestException('Only active offers can be rejected');
    }

    offer.status = 'REJECTED';
    const saved = await this.offerRepository.save(offer);

    await this.negotiationRepository.save(
      this.negotiationRepository.create({
        offerId: offer.id,
        actorUserId: userId,
        action: 'REJECT',
        pricePerUnit: Number(offer.offeredPricePerUnit),
        message: 'Offer rejected.',
        aiSuggested: false,
      }),
    );

    const listing = await this.listingRepository.findOne({ where: { id: offer.listingId } });
    const otherUserId = listing?.farmerId === userId ? offer.buyerId : listing?.farmerId;

    if (otherUserId) {
      await this.notificationsService.createNotification({
        userId: otherUserId,
        title: 'Offer Declined',
        body: `The offer of ₹${offer.offeredPricePerUnit}/unit was declined.`,
        type: 'OFFER_REJECTED',
        referenceId: offer.id,
      });
    }

    return {
      offer: saved,
      action: 'REJECTED',
      message: 'Offer rejected.',
    };
  }

  async counterOffer(
    userId: string,
    offerId: string,
    dto: OfferActionDto,
  ) {
    if (dto.counterPricePerUnit === undefined) {
      throw new BadRequestException(
        'counterPricePerUnit is required for a counter offer',
      );
    }

    const offer = await this.offerRepository.findOne({
      where: { id: offerId },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    if (!['PENDING', 'COUNTERED'].includes(offer.status)) {
      throw new BadRequestException('Only active offers can be countered');
    }

    const counterPrice = Number(dto.counterPricePerUnit);

    offer.offeredPricePerUnit = counterPrice;
    if (dto.quantity !== undefined) {
      offer.quantity = Number(dto.quantity);
    }

    offer.effectiveNetPerUnit = Number(
      (
        counterPrice -
        Number(offer.transportCostPerUnit ?? 0) -
        Number(offer.platformFeePerUnit ?? 0) -
        Number(offer.estimatedRiskCostPerUnit ?? 0)
      ).toFixed(2),
    );

    offer.status = 'COUNTERED';
    const saved = await this.offerRepository.save(offer);

    await this.negotiationRepository.save(
      this.negotiationRepository.create({
        offerId: offer.id,
        actorUserId: userId,
        action: 'COUNTER',
        pricePerUnit: counterPrice,
        message: dto.message ?? 'Counter offer submitted.',
        aiSuggested: false,
      }),
    );

    const listing = await this.listingRepository.findOne({ where: { id: offer.listingId } });
    const isFarmer = listing?.farmerId === userId;
    const recipientId = isFarmer ? offer.buyerId : listing?.farmerId;

    if (recipientId) {
      await this.notificationsService.createNotification({
        userId: recipientId,
        role: isFarmer ? 'BUYER' : 'FARMER',
        title: 'Counter Offer Received',
        body: `${isFarmer ? 'Farmer' : 'Buyer'} responded with a counter offer of ₹${counterPrice}/unit.`,
        type: 'COUNTER_OFFER',
        referenceId: offer.id,
      });
    }

    return {
      offer: saved,
      action: 'COUNTERED',
      counterPricePerUnit: counterPrice,
      message: '✓ Counter offer sent successfully. Other party has been notified.',
    };
  }

  async withdrawOffer(buyerId: string, offerId: string) {
    const offer = await this.offerRepository.findOne({
      where: { id: offerId, buyerId },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found or unauthorized');
    }

    if (offer.status !== 'PENDING') {
      throw new BadRequestException('Only pending offers can be withdrawn');
    }

    offer.status = 'CANCELLED';
    const saved = await this.offerRepository.save(offer);

    return {
      offer: saved,
      message: '✓ Offer withdrawn successfully.',
    };
  }
}
