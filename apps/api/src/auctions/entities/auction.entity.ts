import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum AuctionStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
}

@Entity('auctions')
export class Auction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'listing_id', type: 'uuid' })
  listingId: string;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({
    type: 'enum',
    enum: AuctionStatus,
    enumName: 'auction_status',
  })
  status: AuctionStatus;

  @Column({
    name: 'starts_at',
    type: 'timestamptz',
    nullable: true,
  })
  startsAt: Date | null;

  @Column({
    name: 'ends_at',
    type: 'timestamptz',
    nullable: true,
  })
  endsAt: Date | null;

  @Column({
    name: 'minimum_bid_per_unit',
    type: 'numeric',
    nullable: true,
  })
  minimumBidPerUnit: number | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;
}
