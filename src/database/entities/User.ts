import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import RoleUser from '$database/entities/UserRole';
import Notification from './Notification';
import UserShop from './UserShop';
import { CommonStatus, GenderStatus } from '$types/enums';
import Judge from './Judge';
@Entity({ name: 'user' })
export default class User {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint', unsigned: true })
  id: number;

  @Column({
    name: 'email',
    type: 'varchar',
    length: 255,
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({ name: 'password', type: 'varchar', length: 255, nullable: false })
  password: string;

  @Column({ name: 'username', type: 'varchar', length: 255, nullable: false })
  username: string;

  @Column({ name: 'image', type: 'varchar', length: 10000, nullable: false })
  image: string;

  @Column({ name: 'phone', type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ name: 'gender', type: 'tinyint', nullable: true })
  gender: GenderStatus;

  @Column({
    name: 'status',
    type: 'tinyint',
    comment: '1: active, 0: inactive',
    default: CommonStatus.Active,
  })
  status: number;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth: string;

  @Column({
    name: 'refresh_token',
    type: 'varchar',
    length: 1000,
    default: null,
  })
  refreshToken: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: string | Date;

  @Column({ name: 'role_id', type: 'bigint', unsigned: true, default: 1 })
  roleId: number;

  /* -------------------------------------------------------------------------- */
  /*                                  Relation                                  */
  /* -------------------------------------------------------------------------- */

  @OneToOne(() => UserShop)
  shop: UserShop;

  @ManyToOne(() => RoleUser)
  @JoinColumn({ name: 'role_id', referencedColumnName: 'id' })
  role: RoleUser;

  @OneToMany(() => Notification, (Notification) => Notification.receiver)
  notifications: Notification[];

  @OneToMany(() => Judge, (judge) => judge.user)
  judges: Judge[];
}
