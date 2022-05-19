import { Module } from '@nestjs/common';
import { MemberService } from './member.service';
import { MemberController } from './member.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from '$database/entities/User';
import { AuthModule } from '$shared/auth/auth.module';
import UserShop from '$database/entities/UserShop';
import UserShopType from '$database/entities/UserShopType';
import Order from '$database/entities/Order';
import OrderCart from '$database/entities/OrderCart';
import Product from '$database/entities/Product';
import Like from '$database/entities/Like';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserShop,
      UserShopType,
      Product,
      Order,
      OrderCart,
      Like,
    ]),
    AuthModule,
  ],
  controllers: [MemberController],
  providers: [MemberService],
})
export class MemberModule {}
