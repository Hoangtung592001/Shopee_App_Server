import { CommonStatus } from '$types/enums';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
@Entity({ name: 'images' })
export default class Image {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'product_code', type: 'int', unsigned: true })
  productCode: number;

  @Column({ name: 'name', type: 'varchar', length: 1000, nullable: false })
  name: string;

  @Column({
    name: 'status',
    type: 'int',
    unsigned: true,
    comment: '0: Inactive, 1: active',
    default: CommonStatus.Active,
  })
  status: number;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: string | Date;

  /* -------------------------------------------------------------------------- */
  /*                                  Relation                                  */
  /* -------------------------------------------------------------------------- */
}
