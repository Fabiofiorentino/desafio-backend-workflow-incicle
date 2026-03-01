import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';

@Entity()
export class Template extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;
}
