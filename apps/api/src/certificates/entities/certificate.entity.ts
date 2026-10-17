import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('certificates')
export class Certificate {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  certificateId!: string;

  @Column({ nullable: true })
  productId?: string;

  @Column()
  farmerId!: string;

  @Column({ nullable: true })
  farmerName?: string;

  @Column()
  cropName!: string;

  @Column({ nullable: true })
  variety?: string;

  @Column({ type: 'float', nullable: true })
  quantity?: number;

  @Column({ nullable: true })
  unit?: string;

  @Column({ nullable: true })
  location?: string;

  @Column({ type: 'float' })
  qualityScore!: number;

  @Column({ length: 10 })
  qualityGrade!: string;

  @Column({ type: 'float', default: 91.0 })
  confidence!: number;

  @Column({ type: 'float', nullable: true })
  estimatedPrice?: number;

  @Column({ nullable: true })
  priceRange?: string;

  @Column({ type: 'jsonb', nullable: true })
  assessmentData?: Record<string, any>;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  assessmentDate!: Date;

  @Column({ unique: true })
  verificationToken!: string;

  @Column({ nullable: true })
  pdfPath?: string;

  @CreateDateColumn()
  createdAt!: Date;
}
