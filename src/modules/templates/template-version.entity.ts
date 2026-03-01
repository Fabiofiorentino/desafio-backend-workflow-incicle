import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { Template } from './template.entity';

export enum TemplateStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

@Entity()
@Unique(['template', 'version_number'])
export class TemplateVersion extends BaseEntity {
  @ManyToOne(() => Template)
  @JoinColumn({ name: 'template_id' })
  template: Template;

  @Column()
  template_id: string;

  @Column()
  version_number: number;

  @Column({ type: 'enum', enum: TemplateStatus })
  status: TemplateStatus;

  @Column({ type: 'jsonb' })
  definition: any;

  @Column({ nullable: true })
  published_at: Date;
}
