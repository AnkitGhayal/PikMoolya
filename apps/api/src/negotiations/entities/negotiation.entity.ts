import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('negotiations')
export class Negotiation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'offer_id', type: 'uuid' })
  offerId: string;

  @Column({ name: 'actor_user_id', type: 'uuid' })
  actorUserId: string;

  @Column({
    name: 'action',
    type: 'enum',
    enumName: 'negotiation_action',
    enum: ['OFFER', 'COUNTER', 'ACCEPT', 'REJECT', 'NOTE'],
  })
  action: string;

  @Column({ name: 'price_per_unit', type: 'numeric', nullable: true })
  pricePerUnit: number | null;

  @Column({ name: 'message', type: 'text', nullable: true })
  message: string | null;

  @Column({ name: 'ai_suggested', type: 'boolean', default: false })
  aiSuggested: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
