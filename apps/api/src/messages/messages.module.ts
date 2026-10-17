import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity.js';
import { MessagesService } from './messages.service.js';
import { MessagesController } from './messages.controller.js';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([Message]),
  ],
  providers: [MessagesService],
  controllers: [MessagesController],
  exports: [MessagesService],
})
export class MessagesModule {}
