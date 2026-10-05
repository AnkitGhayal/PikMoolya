import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Crop } from '../../crops/entities/crop.entity.js';

@Entity({ name: 'market_prices' })
export class MarketPrice {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'crop_id', type: 'uuid' })
  cropId!: string;

  @ManyToOne(() => Crop, { eager: true })
  @JoinColumn({ name: 'crop_id' })
  crop!: Crop;

  @Column({ name: 'market_name', type: 'varchar' })
  marketName!: string;

  @Column({ type: 'varchar', nullable: true })
  district!: string | null;

  @Column({ type: 'varchar', nullable: true })
  state!: string | null;

  @Column({ name: 'price_date', type: 'date' })
  priceDate!: string;

  @Column({ name: 'min_price', type: 'numeric', nullable: true })
  minPrice!: number | null;

  @Column({ name: 'max_price', type: 'numeric', nullable: true })
  maxPrice!: number | null;

  @Column({ name: 'modal_price', type: 'numeric', nullable: true })
  modalPrice!: number | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;
}
