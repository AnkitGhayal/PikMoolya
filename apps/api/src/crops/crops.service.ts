import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Crop } from './entities/crop.entity.js';

@Injectable()
export class CropsService {
  constructor(
    @InjectRepository(Crop)
    private readonly cropRepository: Repository<Crop>,
  ) {}

  async getActiveCrops() {
    return this.cropRepository.find({
      where: {
        isActive: true,
      },
      order: {
        name: 'ASC',
        variety: 'ASC',
      },
    });
  }
}
