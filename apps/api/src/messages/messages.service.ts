import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity.js';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async sendMessage(data: {
    senderId: string;
    senderRole?: string;
    receiverId?: string;
    conversationId?: string;
    offerId?: string;
    orderId?: string;
    listingId?: string;
    text: string;
  }) {
    const convId =
      data.conversationId ||
      data.offerId ||
      data.orderId ||
      data.listingId ||
      `conv-${data.senderId}-${data.receiverId}`;

    const msg = this.messageRepository.create({
      conversationId: convId,
      senderId: data.senderId,
      senderRole: data.senderRole ?? null,
      receiverId: data.receiverId ?? null,
      offerId: data.offerId ?? null,
      orderId: data.orderId ?? null,
      listingId: data.listingId ?? null,
      text: data.text,
      isRead: false,
    });

    return this.messageRepository.save(msg);
  }

  async getConversations(userId: string) {
    const messages = await this.messageRepository.find({
      where: [{ senderId: userId }, { receiverId: userId }],
      order: { createdAt: 'DESC' },
    });

    const conversationMap = new Map<string, any>();

    for (const msg of messages) {
      if (!conversationMap.has(msg.conversationId)) {
        conversationMap.set(msg.conversationId, {
          conversationId: msg.conversationId,
          latestMessage: msg.text,
          senderId: msg.senderId,
          receiverId: msg.receiverId,
          offerId: msg.offerId,
          orderId: msg.orderId,
          listingId: msg.listingId,
          updatedAt: msg.createdAt,
          unreadCount: msg.receiverId === userId && !msg.isRead ? 1 : 0,
        });
      }
    }

    return Array.from(conversationMap.values());
  }

  async getConversationMessages(userId: string, conversationId: string) {
    const messages = await this.messageRepository.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });

    // Mark as read
    await this.messageRepository.update(
      { conversationId, receiverId: userId, isRead: false },
      { isRead: true },
    );

    return messages;
  }
}
