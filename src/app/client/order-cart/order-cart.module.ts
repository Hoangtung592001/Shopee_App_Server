import { Module } from '@nestjs/common';
import { OrderCartService } from './order-cart.service';
import { OrderCartController } from './order-cart.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '$shared/auth/auth.module';
import Product from '$database/entities/Product';
import OrderCart from '$database/entities/OrderCart';
import User from '$database/entities/User';
import UserShop from '$database/entities/UserShop';
@Module({
  imports: [
    TypeOrmModule.forFeature([Product, OrderCart, User, UserShop]),
    AuthModule,
  ],
  controllers: [OrderCartController],
  providers: [OrderCartService],
})
export class OrderCartModule {}
