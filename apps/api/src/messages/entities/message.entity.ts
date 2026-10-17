import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'conversation_id', type: 'varchar', length: 255 })
  conversationId: string;

  @Column({ name: 'sender_id', type: 'uuid' })
  senderId: string;

  @Column({ name: 'sender_role', type: 'varchar', length: 50, nullable: true })
  senderRole: string | null;

  @Column({ name: 'receiver_id', type: 'uuid', nullable: true })
  receiverId: string | null;

  @Column({ name: 'offer_id', type: 'uuid', nullable: true })
  offerId: string | null;

  @Column({ name: 'order_id', type: 'uuid', nullable: true })
  orderId: string | null;

  @Column({ name: 'listing_id', type: 'uuid', nullable: true })
  listingId: string | null;

  @Column({ type: 'text' })
  text: string;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
