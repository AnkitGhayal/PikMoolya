import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { AdminService } from './admin.service.js';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  async getStats() {
    return this.adminService.getPlatformStats();
  }

  @Get('users')
  async getUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('orders')
  async getOrders() {
    return this.adminService.getAllOrders();
  }

  @Get('offers')
  async getOffers() {
    return this.adminService.getAllOffers();
  }

  @Get('logistics')
  async getLogistics() {
    return this.adminService.getAllLogistics();
  }
}
