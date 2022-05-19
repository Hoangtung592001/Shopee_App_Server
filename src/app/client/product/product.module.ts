import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '$shared/auth/auth.module';
import Product from '$database/entities/Product';
import OrderCart from '$database/entities/OrderCart';
import User from '$database/entities/User';
import UserShop from '$database/entities/UserShop';
import ProductRecent from '$database/entities/ProductRecent';
import Judge from '$database/entities/Judge';
import Like from '$database/entities/Like';
import Image from '$database/entities/Image';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      OrderCart,
      User,
      UserShop,
      ProductRecent,
      Judge,
      Like,
      Image,
    ]),
    AuthModule,
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
