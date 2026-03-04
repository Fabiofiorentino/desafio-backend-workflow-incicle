import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Template } from './template.entity';

export enum TemplateVersionStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

@Entity('template_versions')
@Index(['templateId', 'version'], { unique: true })
export class TemplateVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'template_id', type: 'uuid' })
  templateId: string;

  @ManyToOne(() => Template, (template) => template.versions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'template_id' })
  template: Template;

  @Column({ type: 'int' })
  version: number;

  @Column({
    type: 'varchar',
    default: 'DRAFT',
  })
  status: TemplateVersionStatus;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  schema: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
