import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum OrderStatus {
  PENDING = 'PENDING',
  CREATED = 'CREATED',
  CONFIRMED = 'CONFIRMED',
  LOGISTICS_REQUESTED = 'LOGISTICS_REQUESTED',
  LOGISTICS_ASSIGNED = 'LOGISTICS_ASSIGNED',
  PICKUP_SCHEDULED = 'PICKUP_SCHEDULED',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
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

  @Column({ name: 'logistics_required', type: 'boolean', default: false })
  logisticsRequired: boolean;

  @Column({
    name: 'logistics_cost',
    type: 'numeric',
    precision: 12,
    scale: 2,
    default: 0,
    nullable: true,
  })
  logisticsCost: number | null;

  @Column({ name: 'logistics_payer', type: 'varchar', length: 50, nullable: true })
  logisticsPayer: string | null;

  @Column({ name: 'logistics_status', type: 'varchar', length: 50, default: 'NOT_REQUESTED', nullable: true })
  logisticsStatus: string | null;

  @Column({ name: 'pickup_details', type: 'text', nullable: true })
  pickupDetails: string | null;

  @Column({ name: 'delivery_details', type: 'text', nullable: true })
  deliveryDetails: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
