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

  @Column({ name: 'crop_id', type: 'uuid' })
  cropId!: string;

  @ManyToOne(() => Crop, { eager: true })
  @JoinColumn({ name: 'crop_id' })
  crop!: Crop;

  @Column({
    name: 'market_name',
    type: 'varchar',
    nullable: true,
  })
  marketName!: string | null;

  @Column({
    name: 'prediction_date',
    type: 'date',
  })
  predictionDate!: string;

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
