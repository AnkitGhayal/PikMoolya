import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Crop } from '../../crops/entities/crop.entity.js';

@Entity({ name: 'price_predictions' })
export class PricePrediction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'crop_id', type: 'uuid', nullable: true })
  cropId!: string | null;

  @ManyToOne(() => Crop, { nullable: true })
  @JoinColumn({ name: 'crop_id' })
  crop!: Crop | null;

  @Column({ name: 'listing_id', type: 'uuid', nullable: true })
  listingId!: string | null;

  @Column({
    name: 'market_name',
    type: 'varchar',
    nullable: true,
  })
  marketName!: string | null;

  @Column({
    name: 'prediction_date',
    type: 'date',
    nullable: true,
  })
  predictionDate!: string | null;

  @Column({
    name: 'predicted_price',
    type: 'numeric',
    nullable: true,
  })
  predictedPrice!: number | null;

  @Column({
    name: 'lower_bound',
    type: 'numeric',
    nullable: true,
  })
  lowerBound!: number | null;

  @Column({
    name: 'upper_bound',
    type: 'numeric',
    nullable: true,
  })
  upperBound!: number | null;

  @Column({
    type: 'numeric',
    nullable: true,
  })
  confidence!: number | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;
}
