import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PICKUP_SCHEDULED = 'PICKUP_SCHEDULED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'listing_id', type: 'uuid' })
  listingId: string;

  @Column({ name: 'farmer_id', type: 'uuid' })
  farmerId: string;

  @Column({ name: 'buyer_id', type: 'uuid' })
  buyerId: string;

  @Column({ name: 'accepted_offer_id', type: 'uuid', nullable: true })
  acceptedOfferId: string | null;

  @Column({ type: 'numeric', precision: 14, scale: 3 })
  quantity: number;

  @Column({
    name: 'agreed_price_per_unit',
    type: 'numeric',
    precision: 14,
    scale: 2,
  })
  agreedPricePerUnit: number;

  @Column({
    name: 'expected_gross',
    type: 'numeric',
    precision: 14,
    scale: 2,
    nullable: true,
  })
  expectedGross: number | null;

  @Column({
    name: 'expected_net',
    type: 'numeric',
    precision: 14,
    scale: 2,
    nullable: true,
  })
  expectedNet: number | null;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    enumName: 'order_status',
  })
  status: OrderStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
