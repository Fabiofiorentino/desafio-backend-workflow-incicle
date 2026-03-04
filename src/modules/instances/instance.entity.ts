import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

import { TemplateVersion } from '../templates/template-version.entity';

export enum InstanceStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
}

@Entity('instances')
@Index(['companyId'])
@Index(['templateVersionId'])
export class Instance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ name: 'template_version_id', type: 'uuid' })
  templateVersionId: string;

  @ManyToOne(() => TemplateVersion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'template_version_id' })
  templateVersion: TemplateVersion;

  @Column({ type: 'jsonb' })
  snapshot: Record<string, any>;

  @Column({
    type: 'varchar',
    default: InstanceStatus.DRAFT,
  })
  status: string;

  @Column({ name: 'submitted_at', type: 'timestamp', nullable: true })
  submittedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
