import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { FarmersService } from './farmers.service.js';
import { CreateFarmerProfileDto } from './dto/create-farmer-profile.dto.js';
import { UpdateFarmerProfileDto } from './dto/update-farmer-profile.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/auth/guards/roles.guard.js';
import { Roles } from '../common/auth/decorators/roles.decorator.js';
import { UserRole } from '../users/entities/user.entity.js';

@Controller('farmers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.FARMER)
export class FarmersController {
  constructor(private readonly farmersService: FarmersService) {}

  @Post('profile')
  async createProfile(
    @Req() request: any,
    @Body() createFarmerProfileDto: CreateFarmerProfileDto,
  ) {
    return this.farmersService.createProfile(
      request.user.userId,
      createFarmerProfileDto,
    );
  }

  @Get('profile')
  async getProfile(@Req() request: any) {
    return this.farmersService.getProfile(request.user.userId);
  }

  @Patch('profile')
  async updateProfile(
    @Req() request: any,
    @Body() updateFarmerProfileDto: UpdateFarmerProfileDto,
  ) {
    return this.farmersService.updateProfile(
      request.user.userId,
      updateFarmerProfileDto,
    );
  }
}