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

  @Column({ type: 'varchar', length: 40, default: 'quintal' })
  unit!: string;

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
