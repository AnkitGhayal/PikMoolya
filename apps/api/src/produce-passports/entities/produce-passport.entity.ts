import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('produce_passports')
export class ProducePassport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'listing_id',
    type: 'uuid',
  })
  listingId: string;

  @Column({
    name: 'lot_id',
    type: 'varchar',
  })
  lotId: string;

  @Column({
    name: 'qr_payload',
    type: 'text',
  })
  qrPayload: string;

  @Column({
    name: 'passport_data',
    type: 'jsonb',
    default: {},
  })
  passportData: Record<string, unknown>;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt: Date;
}
