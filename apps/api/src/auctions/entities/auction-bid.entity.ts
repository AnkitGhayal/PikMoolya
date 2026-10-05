import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('auction_bids')
export class AuctionBid {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'auction_id',
    type: 'uuid',
  })
  auctionId: string;

  @Column({
    name: 'buyer_id',
    type: 'uuid',
  })
  buyerId: string;

  @Column({
    name: 'bid_per_unit',
    type: 'numeric',
  })
  bidPerUnit: number;

  @Column({
    name: 'transport_cost_per_unit',
    type: 'numeric',
    nullable: true,
  })
  transportCostPerUnit: number | null;

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

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;
}
