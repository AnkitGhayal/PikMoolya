import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  role: string | null;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'varchar', length: 50, default: 'INFO' })
  type: string;

  @Column({ name: 'reference_id', type: 'uuid', nullable: true })
  referenceId: string | null;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
