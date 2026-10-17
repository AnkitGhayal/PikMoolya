import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { MessagesService } from './messages.service.js';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async sendMessage(
    @Req() req: any,
    @Body() body: {
      receiverId?: string;
      conversationId?: string;
      offerId?: string;
      orderId?: string;
      listingId?: string;
      text: string;
    },
  ) {
    const userId = req.user?.userId || req.user?.id;
    return this.messagesService.sendMessage({
      senderId: userId,
      senderRole: req.user?.role,
      ...body,
    });
  }

  @Get('conversations')
  async getConversations(@Req() req: any) {
    const userId = req.user?.userId || req.user?.id;
    return this.messagesService.getConversations(userId);
  }

  @Get('conversation/:conversationId')
  async getConversationMessages(
    @Req() req: any,
    @Param('conversationId') conversationId: string,
  ) {
    const userId = req.user?.userId || req.user?.id;
    return this.messagesService.getConversationMessages(userId, conversationId);
  }
}
