import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('offers')
export class Offer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'listing_id', type: 'uuid' })
  listingId: string;

  @Column({ name: 'buyer_id', type: 'uuid' })
  buyerId: string;

  @Column({ name: 'auction_id', type: 'uuid', nullable: true })
  auctionId: string | null;

  @Column({
    name: 'offered_price_per_unit',
    type: 'numeric',
  })
  offeredPricePerUnit: number;

  @Column({
    name: 'transport_cost_per_unit',
    type: 'numeric',
    nullable: true,
  })
  transportCostPerUnit: number | null;

  @Column({
    name: 'platform_fee_per_unit',
    type: 'numeric',
    nullable: true,
  })
  platformFeePerUnit: number | null;

  @Column({
    name: 'estimated_risk_cost_per_unit',
    type: 'numeric',
    nullable: true,
  })
  estimatedRiskCostPerUnit: number | null;

  @Column({
    name: 'effective_net_per_unit',
    type: 'numeric',
    nullable: true,
  })
  effectiveNetPerUnit: number | null;

  @Column({
    name: 'status',
    type: 'enum',
    enumName: 'offer_status',
    enum: [
      'PENDING',
      'ACCEPTED',
      'REJECTED',
      'EXPIRED',
      'CANCELLED',
    ],
  })
  status: string;

  @Column({
    name: 'expires_at',
    type: 'timestamptz',
    nullable: true,
  })
  expiresAt: Date | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt: Date;
}
