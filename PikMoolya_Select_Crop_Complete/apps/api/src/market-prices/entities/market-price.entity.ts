import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';

@Entity('market_prices')
@Index(['cropId', 'priceDate'])
export class MarketPrice {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'crop_id', type: 'uuid' })
  cropId!: string;

  @Column({ name: 'market_name', type: 'varchar', length: 255 })
  marketName!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  district!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  state!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  variety!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  grade!: string | null;

  @Column({ name: 'price_date', type: 'date' })
  priceDate!: string;

  @Column({ name: 'min_price', type: 'numeric', precision: 14, scale: 2, nullable: true })
  minPrice!: string | null;

  @Column({ name: 'max_price', type: 'numeric', precision: 14, scale: 2, nullable: true })
  maxPrice!: string | null;

  @Column({ name: 'modal_price', type: 'numeric', precision: 14, scale: 2, nullable: true })
  modalPrice!: string | null;

  @Column({ name: 'data_source', type: 'varchar', length: 80, default: 'AGMARKNET' })
  dataSource!: string;

  @Column({ name: 'source_record_id', type: 'varchar', length: 255, nullable: true })
  sourceRecordId!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
