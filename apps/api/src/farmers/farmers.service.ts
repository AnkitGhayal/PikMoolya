import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Farmer } from './entities/farmer.entity.js';
import { CreateFarmerProfileDto } from './dto/create-farmer-profile.dto.js';
import { UpdateFarmerProfileDto } from './dto/update-farmer-profile.dto.js';

@Injectable()
export class FarmersService {
  constructor(
    @InjectRepository(Farmer)
    private readonly farmerRepository: Repository<Farmer>,
  ) {}

  async createProfile(
    userId: string,
    createFarmerProfileDto: CreateFarmerProfileDto,
  ) {
    const existingProfile = await this.farmerRepository.findOne({
      where: { userId },
    });

    if (existingProfile) {
      throw new ConflictException(
        'Farmer profile already exists for this user',
      );
    }

    const farmer = this.farmerRepository.create({
      userId,
      fullName: createFarmerProfileDto.fullName,
      address: createFarmerProfileDto.address ?? null,
      village: createFarmerProfileDto.village ?? null,
      district: createFarmerProfileDto.district ?? null,
      state: createFarmerProfileDto.state ?? null,
      pincode: createFarmerProfileDto.pincode ?? null,
      latitude: createFarmerProfileDto.latitude ?? null,
      longitude: createFarmerProfileDto.longitude ?? null,
    });

    const savedFarmer = await this.farmerRepository.save(farmer);

    return {
      message: 'Farmer profile created successfully',
      farmer: savedFarmer,
    };
  }

  async getProfile(userId: string) {
    const farmer = await this.farmerRepository.findOne({
      where: { userId },
    });

    if (!farmer) {
      throw new NotFoundException('Farmer profile not found');
    }

    return farmer;
  }

  async updateProfile(
    userId: string,
    updateFarmerProfileDto: UpdateFarmerProfileDto,
  ) {
    const farmer = await this.farmerRepository.findOne({
      where: { userId },
    });

    if (!farmer) {
      throw new NotFoundException('Farmer profile not found');
    }

    Object.assign(farmer, updateFarmerProfileDto);

    const updatedFarmer = await this.farmerRepository.save(farmer);

    return {
      message: 'Farmer profile updated successfully',
      farmer: updatedFarmer,
    };
  }
}