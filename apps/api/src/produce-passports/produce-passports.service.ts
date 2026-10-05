import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProduceListing } from '../produce/entities/produce-listing.entity.js';
import { ProducePassport } from './entities/produce-passport.entity.js';
import { CreateProducePassportDto } from './dto/create-produce-passport.dto.js';

@Injectable()
export class ProducePassportsService {
  constructor(
    @InjectRepository(ProduceListing)
    private readonly listingRepository: Repository<ProduceListing>,
    @InjectRepository(ProducePassport)
    private readonly passportRepository: Repository<ProducePassport>,
  ) {}



  async updatePassportStage(
    lotId: string,
    stage: string,
    qualityScore?: number,
    notes?: string,
  ) {
    const passport =
      await this.passportRepository.findOne({
        where: {
          lotId,
        },
      });

    if (!passport) {
      throw new NotFoundException(
        'Produce passport not found',
      );
    }

    const existingData =
      passport.passportData ?? {};

    const history = Array.isArray(
      existingData['history'],
    )
      ? existingData['history']
      : [];

    history.push({
      stage,
      qualityScore: qualityScore ?? null,
      notes: notes ?? null,
      recordedAt: new Date().toISOString(),
    });

    passport.passportData = {
      ...existingData,
      currentStage: stage,
      history,
    };

    const saved =
      await this.passportRepository.save(passport);

    return {
      lotId: saved.lotId,
      currentStage:
        saved.passportData['currentStage'],
      history:
        saved.passportData['history'],
      updatedAt: saved.updatedAt,
    };
  }

  async getPassportByListingId(
    userId: string,
    listingId: string,
  ) {
    const listing =
      await this.listingRepository.findOne({
        where: {
          id: listingId,
          farmerId: userId,
        },
      });

    if (!listing) {
      throw new NotFoundException(
        'Produce listing not found',
      );
    }

    const passport =
      await this.passportRepository.findOne({
        where: {
          listingId,
        },
      });

    if (!passport) {
      throw new NotFoundException(
        'Produce passport not found for this listing',
      );
    }

    return passport;
  }
  async getPassportHistory(lotId: string) {
    const passport = await this.passportRepository.findOne({
      where: {
        lotId,
      },
    });

    if (!passport) {
      throw new NotFoundException(
        'Produce passport not found',
      );
    }

    return {
      lotId: passport.lotId,
      listingId: passport.listingId,
      currentStage:
        passport.passportData?.currentStage ?? 'LISTING',
      stages:
        passport.passportData?.stages ?? [
          'LISTING',
          'PURCHASE',
          'PICKUP',
          'DELIVERY',
        ],
      passportData: passport.passportData,
      createdAt: passport.createdAt,
      updatedAt: passport.updatedAt,
    };
  }
  async getPassportByLotId(lotId: string) {
    const passport = await this.passportRepository.findOne({
      where: {
        lotId,
      },
    });

    if (!passport) {
      throw new NotFoundException(
        'Produce passport not found',
      );
    }

    return passport;
  }
  async createPassport(
    userId: string,
    dto: CreateProducePassportDto,
  ) {
    const listing =
      await this.listingRepository.findOne({
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

    const existingPassport =
      await this.passportRepository.findOne({
        where: {
          listingId: listing.id,
        },
      });

    if (existingPassport) {
      return existingPassport;
    }

    const lotId = "PIK-" + listing.id.substring(0, 8).toUpperCase() + "-" + Date.now();

    return {
      lotId,

      listingId: listing.id,

      produce: {
        crop: listing.crop,
        quantity: listing.quantity,
        unit: listing.unit,
        harvestDate: listing.harvestDate,
        location: listing.locationName,
      },

      passport: {
        status: 'ACTIVE',
        createdAt: new Date(),
        notes: dto.notes ?? null,
      },

      tracking: {
        currentStage: 'LISTING',
        stages: [
          'LISTING',
          'PURCHASE',
          'PICKUP',
          'DELIVERY',
        ],
      },

      qr: {
        type: 'PRODUCE_PASSPORT',
        value: lotId,
      },

      explanation:
        'The Produce Passport gives the produce lot a unique identity that can be used to track quality and transaction events throughout its journey.',

      disclaimer:
        'Passport information is based on recorded transaction and verification events. It does not by itself guarantee produce quality.',
    };
  }
}










