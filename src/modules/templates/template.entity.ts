import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { TemplateVersion } from './template-version.entity';

@Entity('templates')
@Index(['companyId', 'name'], { unique: true })
export class Template {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'uuid' })
  @Index()
  companyId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @OneToMany(() => TemplateVersion, (version) => version.template, {
    cascade: false,
  })
  versions: TemplateVersion[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
