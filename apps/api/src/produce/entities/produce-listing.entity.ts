import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Crop } from '../../crops/entities/crop.entity.js';

export enum ProduceListingStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  PARTIALLY_SOLD = 'PARTIALLY_SOLD',
  SOLD = 'SOLD',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

@Entity({ name: 'produce_listings' })
export class ProduceListing {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'farmer_id', type: 'uuid' })
  farmerId!: string;

  @Column({ name: 'farm_id', type: 'uuid', nullable: true })
  farmId!: string | null;

  @Column({ name: 'crop_id', type: 'uuid' })
  cropId!: string;

  @ManyToOne(() => Crop, { eager: true })
  @JoinColumn({ name: 'crop_id' })
  crop!: Crop;

  @Column({ type: 'numeric', precision: 14, scale: 3 })
  quantity!: number;

  @Column({ name: 'total_available_quantity', type: 'numeric', precision: 14, scale: 3, nullable: true })
  totalAvailableQuantity!: number | null;

  @Column({ name: 'remaining_quantity', type: 'numeric', precision: 14, scale: 3, nullable: true })
  remainingQuantity!: number | null;

  @Column({ name: 'sold_quantity', type: 'numeric', precision: 14, scale: 3, default: 0 })
  soldQuantity!: number;

  @Column({ name: 'reserved_quantity', type: 'numeric', precision: 14, scale: 3, default: 0 })
  reservedQuantity!: number;

  @Column({ name: 'min_buyer_quantity', type: 'numeric', precision: 14, scale: 3, nullable: true })
  minBuyerQuantity!: number | null;

  @Column({ name: 'number_of_bags', type: 'int', nullable: true })
  numberOfBags!: number | null;

  @Column({ name: 'avg_bag_weight', type: 'numeric', precision: 14, scale: 3, nullable: true })
  avgBagWeight!: number | null;

  @Column({ name: 'measured_quantity', type: 'numeric', precision: 14, scale: 3, nullable: true })
  measuredQuantity!: number | null;

  @Column({ name: 'measurement_method', type: 'varchar', length: 60, nullable: true })
  measurementMethod!: string | null;

  @Column({ name: 'measurement_timestamp', type: 'timestamptz', nullable: true })
  measurementTimestamp!: Date | null;

  @Column({ name: 'measurement_source', type: 'varchar', length: 120, nullable: true })
  measurementSource!: string | null;

  @Column({ name: 'device_info', type: 'jsonb', nullable: true })
  deviceInfo!: Record<string, any> | null;

  @Column({ type: 'varchar', length: 40, default: 'quintal' })
  unit!: string;

  @Column({ name: 'expected_price', type: 'numeric', precision: 14, scale: 2, nullable: true })
  expectedPrice!: number | null;

  @Column({ name: 'min_acceptable_price', type: 'numeric', precision: 14, scale: 2, nullable: true })
  minAcceptablePrice!: number | null;

  @Column({ name: 'negotiation_preference', type: 'varchar', length: 60, nullable: true })
  negotiationPreference!: string | null;

  @Column({ name: 'delivery_preference', type: 'varchar', length: 120, nullable: true })
  deliveryPreference!: string | null;

  @Column({ name: 'listing_visibility', type: 'varchar', length: 40, default: 'PUBLIC' })
  listingVisibility!: string;

  @Column({ name: 'quality_description', type: 'text', nullable: true })
  qualityDescription!: string | null;

  @Column({ name: 'visible_condition', type: 'varchar', length: 120, nullable: true })
  visibleCondition!: string | null;

  @Column({ name: 'storage_info', type: 'text', nullable: true })
  storageInfo!: string | null;

  @Column({ name: 'location_approximate', type: 'varchar', length: 255, nullable: true })
  locationApproximate!: string | null;

  @Column({ name: 'harvest_date', type: 'date', nullable: true })
  harvestDate!: string | null;

  @Column({
    name: 'location_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  locationName!: string | null;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 7,
    nullable: true,
  })
  latitude!: number | null;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 7,
    nullable: true,
  })
  longitude!: number | null;

  @Column({
    name: 'production_cost_per_unit',
    type: 'numeric',
    precision: 14,
    scale: 2,
    nullable: true,
  })
  productionCostPerUnit!: number | null;

  @Column({
    name: 'transport_cost_per_unit',
    type: 'numeric',
    precision: 14,
    scale: 2,
    nullable: true,
  })
  transportCostPerUnit!: number | null;

  @Column({
    name: 'storage_cost_per_unit',
    type: 'numeric',
    precision: 14,
    scale: 2,
    nullable: true,
  })
  storageCostPerUnit!: number | null;

  @Column({
    name: 'packaging_cost_per_unit',
    type: 'numeric',
    precision: 14,
    scale: 2,
    nullable: true,
  })
  packagingCostPerUnit!: number | null;

  @Column({
    name: 'other_cost_per_unit',
    type: 'numeric',
    precision: 14,
    scale: 2,
    nullable: true,
  })
  otherCostPerUnit!: number | null;

  @Column({
    name: 'desired_min_return_per_unit',
    type: 'numeric',
    precision: 14,
    scale: 2,
    nullable: true,
  })
  desiredMinReturnPerUnit!: number | null;

  @Column({
    type: 'enum',
    enum: ProduceListingStatus,
    enumName: 'listing_status',
  })
  status!: ProduceListingStatus;

  @Column({
    name: 'published_at',
    type: 'timestamptz',
    nullable: true,
  })
  publishedAt!: Date | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt!: Date;
}
