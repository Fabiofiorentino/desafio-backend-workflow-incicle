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

import { Template } from '../templates/template.entity';
import { TemplateVersion } from '../templates/template-version.entity';

export enum InstanceStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
}

@Entity('instances')
@Index(['companyId'])
@Index(['templateId'])
export class Instance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  companyId: string;

  @Column({ type: 'uuid' })
  templateId: string;

  @ManyToOne(() => Template, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'templateId' })
  template: Template;

  @Column({ type: 'uuid' })
  versionId: string;

  @ManyToOne(() => TemplateVersion, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'versionId' })
  templateVersion: TemplateVersion;

  // Dados enviados pelo cliente
  @Column({ type: 'jsonb', nullable: true })
  payload: Record<string, any>;

  // Snapshot imutável da versão no momento do submit
  @Column({ type: 'jsonb', nullable: true })
  snapshot: Record<string, any> | null;

  @Column({
    type: 'enum',
    enum: InstanceStatus,
    default: InstanceStatus.DRAFT,
  })
  status: InstanceStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  submittedAt: Date | null;
}
