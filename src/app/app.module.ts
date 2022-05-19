import { AllExceptionsFilter } from '$core/filters/http-exception.filter';
import { RolesGuard } from '$core/guards/roles.guard';
import { TransformResponseInterceptor } from '$core/interceptors/transform-res.interceptor';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAuthGuard } from '$app/shared/auth/jwt-auth.guard';
import { LoggerMiddleware } from '$core/middleware/logger.middleware';
import { AdminModule } from '$app/admin/admin.module';
import { ConfigModule } from '@nestjs/config';
import { ClientModule } from './client/client.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import Notification from '$database/entities/Notification';
import NotificationType from '$database/entities/NotificationType';
import Order from '$database/entities/Order';
import OrderCart from '$database/entities/OrderCart';
import OrderDetail from '$database/entities/OrderDetail';
import Product from '$database/entities/Product';
import ProductLine from '$database/entities/ProductLine';
import TransferringMethod from '$database/entities/TransferringMethod';
import User from '$database/entities/User';
import UserRole from '$database/entities/UserRole';
import Judge from '$database/entities/Judge';
import Like from '$database/entities/Like';
import Voucher from '$database/entities/Voucher';
import UserShopType from '$database/entities/UserShopType';
import UserShop from '$database/entities/UserShop';
import ProductRecent from '$database/entities/ProductRecent';
import Image from '$database/entities/Image';
@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.MYSQL_HOST,
      port: +process.env.MYSQL_PORT,
      username: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASS,
      database: process.env.MYSQL_DBNAME,
      supportBigNumbers: false,
      synchronize: true, // Do not use synchronize
      logging: true,
      charset: 'utf8mb4',
      entities: [
        Notification,
        NotificationType,
        Order,
        OrderCart,
        OrderDetail,
        Product,
        ProductLine,
        ProductRecent,
        UserShopType,
        UserShop,
        TransferringMethod,
        User,
        UserRole,
        Judge,
        Like,
        Voucher,
        Image,
      ],
    }),
    AdminModule,
    ClientModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformResponseInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
