import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  JoinColumn,
  OneToOne,
  ManyToOne,
} from 'typeorm';
import Product from './Product';
import User from './User';
import { CommonStatus, ShopType } from '$types/enums';
import UserShopType from './UserShopType';

@Entity({ name: 'user_shop' })
export default class UserShop {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint', unsigned: true })
  id: number;

  @Column({
    name: 'shop_name',
    type: 'varchar',
    length: 50,
    nullable: false,
    unique: true,
  })
  shopName: string;

  @Column({ name: 'address', type: 'varchar', length: 255 })
  address: string;

  @Column({
    name: 'shop_type_id',
    type: 'int',
    unsigned: true,
    comment: '0: Normal 1: Mall',
    default: ShopType.Normal,
  })
  shopTypeId: number;

  @Column({ name: 'owner_id', type: 'bigint', unsigned: true })
  ownerId: number;

  @Column({
    name: 'status',
    type: 'tinyint',
    comment: '1: active, 0: Inactive',
    default: CommonStatus.Active,
  })
  status: number;

  @CreateDateColumn({ name: 'registered_at', type: 'datetime' })
  registeredAt: string;

  /* -------------------------------------------------------------------------- */
  /*                                  Relation                                  */
  /* -------------------------------------------------------------------------- */

  @OneToMany(() => Product, (product) => product.seller)
  products: Product[];

  @ManyToOne(() => UserShopType)
  @JoinColumn({ name: 'shop_type_id', referencedColumnName: 'id' })
  shopType: UserShopType;

  @OneToOne(() => User)
  @JoinColumn({ name: 'owner_id', referencedColumnName: 'id' })
  owner: User;
}
