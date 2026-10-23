import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Notification } from './entities/notification.entity.js';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly dataSource: DataSource,
  ) {}

  private async resolveToUserId(id: string): Promise<string> {
    if (!id || id === 'ALL') return id;
    try {
      // Check if id is already a user_id
      const user = await this.dataSource.query('SELECT id FROM users WHERE id = $1 LIMIT 1', [id]);
      if (user && user.length > 0) return id;

      // Check if it's a farmer_id
      const farmer = await this.dataSource.query('SELECT user_id FROM farmers WHERE id = $1 LIMIT 1', [id]);
      if (farmer && farmer.length > 0 && farmer[0].user_id) return farmer[0].user_id;

      // Check if it's a buyer_id
      const buyer = await this.dataSource.query('SELECT user_id FROM buyers WHERE id = $1 LIMIT 1', [id]);
      if (buyer && buyer.length > 0 && buyer[0].user_id) return buyer[0].user_id;
    } catch {
      // Fallback to original id
    }
    return id;
  }

  async createNotification(data: {
    userId: string;
    role?: string;
    title: string;
    body: string;
    type?: string;
    referenceId?: string;
  }) {
    try {
      const resolvedUserId = await this.resolveToUserId(data.userId);
      const notif = this.notificationRepository.create({
        userId: resolvedUserId,
        role: data.role ?? null,
        title: data.title,
        body: data.body,
        type: data.type ?? 'INFO',
        referenceId: data.referenceId ?? null,
        isRead: false,
      });
      return await this.notificationRepository.save(notif);
    } catch (e) {
      console.warn('Could not persist notification:', e);
      return null;
    }
  }

  async getUserNotifications(userId: string) {
    return this.notificationRepository.find({
      where: [{ userId }, { userId: 'ALL' }],
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async getUnreadCount(userId: string) {
    const count = await this.notificationRepository.count({
      where: [
        { userId, isRead: false },
        { userId: 'ALL', isRead: false },
      ],
    });
    return { unreadCount: count };
  }

  async markAsRead(userId: string, notificationId: string) {
    const notif = await this.notificationRepository.findOne({
      where: { id: notificationId },
    });
    if (notif) {
      notif.isRead = true;
      await this.notificationRepository.save(notif);
    }
    return { success: true };
  }

  async markAllAsRead(userId: string) {
    await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );
    return { success: true };
  }
}
