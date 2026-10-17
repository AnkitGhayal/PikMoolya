import {
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { NotificationsService } from './notifications.service.js';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(@Req() req: any) {
    const userId = req.user?.userId || req.user?.id;
    return this.notificationsService.getUserNotifications(userId);
  }

  @Get('unread-count')
  async getUnreadCount(@Req() req: any) {
    const userId = req.user?.userId || req.user?.id;
    return this.notificationsService.getUnreadCount(userId);
  }

  @Patch(':id/read')
  async markAsRead(
    @Req() req: any,
    @Param('id') id: string,
  ) {
    const userId = req.user?.userId || req.user?.id;
    return this.notificationsService.markAsRead(userId, id);
  }

  @Patch('read-all')
  async markAllAsRead(@Req() req: any) {
    const userId = req.user?.userId || req.user?.id;
    return this.notificationsService.markAllAsRead(userId);
  }
}
