import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity.js';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async createNotification(data: {
    userId: string;
    role?: string;
    title: string;
    body: string;
    type?: string;
    referenceId?: string;
  }) {
    const notif = this.notificationRepository.create({
      userId: data.userId,
      role: data.role ?? null,
      title: data.title,
      body: data.body,
      type: data.type ?? 'INFO',
      referenceId: data.referenceId ?? null,
      isRead: false,
    });
    return this.notificationRepository.save(notif);
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
