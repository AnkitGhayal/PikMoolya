import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity.js';

@Entity({ name: 'farmers' })
export class Farmer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({
    name: 'user_id',
    type: 'uuid',
    unique: true,
  })
  userId!: string;

  @Column({
    name: 'full_name',
    type: 'varchar',
    length: 200,
  })
  fullName!: string;

  @Column({
    name: 'address',
    type: 'text',
    nullable: true,
  })
  address!: string | null;

  @Column({
    name: 'village',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  village!: string | null;

  @Column({
    name: 'district',
    type: 'varchar',
    length: 120,
    nullable: true,
  })
  district!: string | null;

  @Column({
    name: 'state',
    type: 'varchar',
    length: 120,
    nullable: true,
  })
  state!: string | null;

  @Column({
    name: 'pincode',
    type: 'varchar',
    length: 10,
    nullable: true,
  })
  pincode!: string | null;

  @Column({
    name: 'latitude',
    type: 'numeric',
    precision: 10,
    scale: 7,
    nullable: true,
  })
  latitude!: number | null;

  @Column({
    name: 'longitude',
    type: 'numeric',
    precision: 10,
    scale: 7,
    nullable: true,
  })
  longitude!: number | null;

  @Column({
    name: 'trust_score',
    type: 'double precision',
    default: 0,
  })
  trustScore!: number;

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