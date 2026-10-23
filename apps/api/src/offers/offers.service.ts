import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';

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

    private readonly dataSource: DataSource,
    private readonly negotiationsService: NegotiationsService,
    private readonly ordersService: OrdersService,
    private readonly logisticsService: LogisticsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private async resolveUserRoleEntities(userId: string): Promise<{ buyerId: string | null; farmerId: string | null }> {
    const [buyerRows, farmerRows] = await Promise.all([
      this.dataSource.query('SELECT id FROM buyers WHERE user_id = $1 LIMIT 1', [userId]),
      this.dataSource.query('SELECT id FROM farmers WHERE user_id = $1 LIMIT 1', [userId]),
    ]);
    return {
      buyerId: (buyerRows?.[0]?.id as string) || null,
      farmerId: (farmerRows?.[0]?.id as string) || null,
    };
  }

  private async getOrCreateBuyerId(userId: string): Promise<string> {
    const buyerRows = await this.dataSource.query(
      'SELECT id FROM buyers WHERE user_id = $1 LIMIT 1',
      [userId],
    );
    if (buyerRows && buyerRows.length > 0) {
      return buyerRows[0].id;
    }
    const userRows = await this.dataSource.query(
      'SELECT phone, email FROM users WHERE id = $1',
      [userId],
    );
    const bName = userRows?.[0]?.phone ? `Buyer (${userRows[0].phone})` : 'Registered Marketplace Buyer';
    const newBuyer = await this.dataSource.query(
      `INSERT INTO buyers (user_id, business_name, buyer_type)
       VALUES ($1, $2, 'WHOLESALE_TRADER')
       RETURNING id`,
      [userId, bName],
    );
    return newBuyer[0].id;
  }

  async createOffer(
    userId: string,
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

    const { farmerId: userFarmerId } = await this.resolveUserRoleEntities(userId);
    if (listing.farmerId === userId || (userFarmerId && listing.farmerId === userFarmerId)) {
      throw new BadRequestException(
        'A farmer cannot place an offer on their own listing',
      );
    }

    const resolvedBuyerId = await this.getOrCreateBuyerId(userId);

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
          buyerId: resolvedBuyerId,
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

    await this.negotiationRepository.save(
      this.negotiationRepository.create({
        offerId: savedOffer.id,
        actorUserId: userId,
        action: 'OFFER' as any,
        pricePerUnit: Number(savedOffer.offeredPricePerUnit),
        message: dto.message || (dto.deliveryTerms ? `Terms: ${dto.deliveryTerms}` : 'Initial purchase offer submitted.'),
        aiSuggested: false,
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
      userId: userId,
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

  async getFarmerOffers(userId: string) {
    const { farmerId } = await this.resolveUserRoleEntities(userId);
    const listings = await this.listingRepository.find({
      where: [
        { farmerId: userId },
        ...(farmerId ? [{ farmerId }] : []),
      ],
      relations: { crop: true },
    });

    const listingIds = listings.map((l) => l.id);

    if (listingIds.length === 0) {
      return { farmerId: userId, offers: [], offerCount: 0 };
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
      farmerId: userId,
      offers: result,
      offerCount: result.length,
    };
  }

  async getBuyerOffers(userId: string) {
    const { buyerId } = await this.resolveUserRoleEntities(userId);
    const offers =
      await this.offerRepository.find({
        where: [
          { buyerId: userId },
          ...(buyerId ? [{ buyerId }] : []),
        ],
        order: {
          createdAt: 'DESC',
        },
      });

    const listingIds = [...new Set(offers.map((o) => o.listingId))];
    const listings = listingIds.length > 0
      ? await this.listingRepository.find({
          where: { id: In(listingIds) },
          relations: { crop: true },
        })
      : [];

    const enrichedOffers = offers.map((offer) => {
      const listing = listings.find((l) => l.id === offer.listingId);
      return {
        ...offer,
        cropName: listing?.crop?.name || 'Produce',
        unit: listing?.unit || 'kg',
        listingPrice: listing?.expectedPrice ? Number(listing.expectedPrice) : null,
      };
    });

    return {
      buyerId: userId,
      offers: enrichedOffers,
      offerCount: enrichedOffers.length,
    };
  }

  async acceptOffer(
    userId: string,
    offerId: string,
    dto?: OfferActionDto,
  ) {
    const offer = await this.offerRepository.findOne({
      where: { id: offerId },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    const listing = await this.listingRepository.findOne({
      where: { id: offer.listingId },
      relations: { crop: true },
    });

    if (!listing) {
      throw new NotFoundException('Produce listing not found');
    }

    const { buyerId, farmerId } = await this.resolveUserRoleEntities(userId);
    const isBuyer = offer.buyerId === userId || (buyerId && offer.buyerId === buyerId);
    const isFarmer = listing.farmerId === userId || (farmerId && listing.farmerId === farmerId);

    if (!isBuyer && !isFarmer) {
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
        message: dto?.message || 'Offer accepted.',
        aiSuggested: false,
      }),
    );

    const isLogisticsRequired = Boolean(dto?.logisticsRequired);

    // Create Order with explicit logistics decision
    let createdOrderResult: any = null;
    let logisticsRequest: any = null;

    try {
      createdOrderResult = await this.ordersService.createFromAcceptedOffer(userId, offer.id, {
        logisticsRequired: isLogisticsRequired,
        logisticsCost: dto?.logisticsCost,
        logisticsPayer: dto?.logisticsPayer || 'BUYER',
        pickupDetails: dto?.pickupDetails,
        deliveryDetails: dto?.deliveryDetails,
      });

      if (isLogisticsRequired && createdOrderResult?.order) {
        logisticsRequest = await this.logisticsService.createForOrder(
          createdOrderResult.order,
          listing.crop?.name || 'Produce',
          listing.unit || 'kg',
        );
      }
    } catch (e: any) {
      console.warn('Could not create order from accepted offer:', e?.message || e);
    }

    const cropName = listing.crop?.name || 'Produce';
    const logisticsNote = isLogisticsRequired
      ? 'Delivery requested via logistics partner.'
      : 'Self-pickup / direct transportation arranged between parties.';

    // Notify Farmer & Buyer
    await this.notificationsService.createNotification({
      userId: listing.farmerId,
      role: 'FARMER',
      title: '✓ Offer Confirmed & Order Created',
      body: `Offer of ₹${offer.offeredPricePerUnit}/unit for ${cropName} was accepted. ${logisticsNote}`,
      type: 'OFFER_ACCEPTED',
      referenceId: offer.id,
    });

    await this.notificationsService.createNotification({
      userId: offer.buyerId,
      role: 'BUYER',
      title: '✓ Offer Accepted & Order Confirmed',
      body: `Your transaction for ${cropName} at ₹${offer.offeredPricePerUnit}/unit is confirmed. ${logisticsNote}`,
      type: 'OFFER_ACCEPTED',
      referenceId: offer.id,
    });

    return {
      offer: saved,
      order: createdOrderResult?.order ?? null,
      logisticsRequest: logisticsRequest ?? null,
      logisticsRequired: isLogisticsRequired,
      action: 'ACCEPTED',
      message: isLogisticsRequired
        ? '✓ Offer accepted. Order created and delivery partner requested.'
        : '✓ Offer accepted. Order created for direct self-pickup/transportation.',
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
    const { buyerId, farmerId } = await this.resolveUserRoleEntities(userId);
    const isFarmer = listing?.farmerId === userId || (farmerId && listing?.farmerId === farmerId);
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

  async withdrawOffer(userId: string, offerId: string) {
    const { buyerId } = await this.resolveUserRoleEntities(userId);
    const offer = await this.offerRepository.findOne({
      where: [
        { id: offerId, buyerId: userId },
        ...(buyerId ? [{ id: offerId, buyerId }] : []),
      ],
    });

    if (!offer) {
      throw new NotFoundException('Offer not found or unauthorized');
    }

    if (offer.status !== 'PENDING') {
      throw new BadRequestException('Only pending offers can be withdrawn');
    }

    offer.status = 'CANCELLED';
    const saved = await this.offerRepository.save(offer);

    await this.negotiationRepository.save(
      this.negotiationRepository.create({
        offerId: saved.id,
        actorUserId: userId,
        action: 'REJECT' as any,
        pricePerUnit: Number(saved.offeredPricePerUnit),
        message: 'Offer withdrawn by buyer.',
        aiSuggested: false,
      }),
    );

    return {
      offer: saved,
      message: '✓ Offer withdrawn successfully.',
    };
  }

  async getOfferHistory(userId: string, offerId: string) {
    const offer = await this.offerRepository.findOne({
      where: { id: offerId },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    const listing = await this.listingRepository.findOne({
      where: { id: offer.listingId },
      relations: { crop: true },
    });

    const { buyerId, farmerId } = await this.resolveUserRoleEntities(userId);
    const isBuyer = offer.buyerId === userId || (buyerId && offer.buyerId === buyerId);
    const isFarmer = listing?.farmerId === userId || (farmerId && listing?.farmerId === farmerId);

    if (!isBuyer && !isFarmer) {
      const user = await this.dataSource.query('SELECT role FROM users WHERE id = $1', [userId]);
      if (user?.[0]?.role !== 'ADMIN') {
        throw new BadRequestException('You are not authorized to view this negotiation history');
      }
    }

    const timeline = await this.negotiationRepository.find({
      where: { offerId },
      order: { createdAt: 'ASC' },
    });

    const actorIds = [...new Set(timeline.map((t) => t.actorUserId))];
    const userMap: Record<string, { role: string; phone: string }> = {};
    if (actorIds.length > 0) {
      const users = await this.dataSource.query(
        'SELECT id, role, phone FROM users WHERE id = ANY($1)',
        [actorIds],
      );
      for (const u of users) {
        userMap[u.id] = { role: u.role, phone: u.phone };
      }
    }

    const enrichedTimeline = timeline.map((entry) => ({
      id: entry.id,
      action: entry.action,
      pricePerUnit: entry.pricePerUnit ? Number(entry.pricePerUnit) : null,
      message: entry.message,
      createdAt: entry.createdAt,
      actorRole: userMap[entry.actorUserId]?.role || (entry.actorUserId === offer.buyerId ? 'BUYER' : 'FARMER'),
      isSelf: entry.actorUserId === userId,
    }));

    const qty = Number(offer.quantity || listing?.quantity || 1);
    const price = Number(offer.offeredPricePerUnit);

    return {
      offerId: offer.id,
      status: offer.status,
      cropName: listing?.crop?.name || 'Agricultural Produce',
      unit: listing?.unit || 'kg',
      originalListingPrice: listing?.expectedPrice ? Number(listing.expectedPrice) : null,
      currentPricePerUnit: price,
      quantity: qty,
      totalValue: price * qty,
      buyerId: offer.buyerId,
      farmerId: listing?.farmerId,
      deliveryTerms: offer.deliveryTerms,
      paymentTerms: offer.paymentTerms,
      createdAt: offer.createdAt,
      updatedAt: offer.updatedAt,
      timeline: enrichedTimeline,
    };
  }
}
