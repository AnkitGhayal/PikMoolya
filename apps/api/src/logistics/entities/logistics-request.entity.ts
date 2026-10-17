import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum LogisticsStatus {
  REQUESTED = 'REQUESTED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  PICKUP_SCHEDULED = 'PICKUP_SCHEDULED',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
}

@Entity('logistics_requests')
export class LogisticsRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @Column({ name: 'logistics_partner_id', type: 'uuid', nullable: true })
  logisticsPartnerId: string | null;

  @Column({ name: 'farmer_id', type: 'uuid' })
  farmerId: string;

  @Column({ name: 'buyer_id', type: 'uuid' })
  buyerId: string;

  @Column({ name: 'pickup_location', type: 'text' })
  pickupLocation: string;

  @Column({ name: 'delivery_location', type: 'text' })
  deliveryLocation: string;

  @Column({ name: 'crop_name', type: 'varchar', length: 100 })
  cropName: string;

  @Column({ type: 'numeric', precision: 14, scale: 3 })
  quantity: number;

  @Column({ type: 'varchar', length: 40, default: 'kg' })
  unit: string;

  @Column({ name: 'distance_km', type: 'numeric', precision: 10, scale: 2, default: 25 })
  distanceKm: number;

  @Column({ name: 'vehicle_type', type: 'varchar', length: 50, default: 'Medium Truck' })
  vehicleType: string;

  @Column({ name: 'estimated_cost', type: 'numeric', precision: 12, scale: 2, default: 1200 })
  estimatedCost: number;

  @Column({
    type: 'varchar',
    length: 50,
    default: LogisticsStatus.REQUESTED,
  })
  status: LogisticsStatus;

  @Column({ name: 'pickup_date', type: 'timestamptz', nullable: true })
  pickupDate: Date | null;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
