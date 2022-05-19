import { ProductStatus } from '$types/enums';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import Judge from './Judge';
import Like from './Like';
import UserShop from './UserShop';

@Entity({ name: 'product' })
export default class Product {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint', unsigned: true })
  id: number;

  @Column({
    name: 'product_name',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  productName: string;

  @Column({ name: 'product_line', type: 'int' })
  productLine: number;

  @Column({
    name: 'quantity_in_stock',
    type: 'bigint',
    unsigned: true,
    nullable: false,
  })
  quantityInStock: number;

  @Column({
    name: 'price_each',
    type: 'double',
    unsigned: true,
    nullable: false,
  })
  priceEach: number;

  @Column({ name: 'image', type: 'varchar', length: 5000, nullable: false })
  image: string;

  @Column({
    name: 'description',
    type: 'varchar',
    length: 5000,
    nullable: false,
  })
  description: string;

  @Column({ name: 'origin', type: 'varchar', length: 255, nullable: false })
  origin: string;

  @Column({ name: 'discount', type: 'double' })
  discount: number;

  @Column({
    name: 'status',
    type: 'tinyint',
    comment: '0: Deleted, 1: Active, 2: SoldOff',
    default: ProductStatus.Active,
  })
  status: number;

  @Column({
    name: 'sold_quantity',
    type: 'bigint',
    unsigned: true,
    nullable: false,
    default: 0,
  })
  soldQuantity: number;

  @Column({ name: 'seller_id', type: 'int', unsigned: true, nullable: false })
  sellerId: number;

  @Column({ name: 'shop_type_id', type: 'int', unsigned: true, default: 1 })
  shopTypeId: number;

  /* -------------------------------------------------------------------------- */
  /*                                  Relation                                  */
  /* -------------------------------------------------------------------------- */

  @OneToMany(() => Like, (like) => like.product)
  likes: Like[];

  @OneToMany(() => Judge, (judge) => judge.product)
  judges: Judge[];

  @ManyToOne(() => UserShop)
  @JoinColumn({ name: 'seller_id', referencedColumnName: 'id' })
  seller: UserShop;
}
