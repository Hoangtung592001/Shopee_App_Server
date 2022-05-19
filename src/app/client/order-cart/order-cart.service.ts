import { Injectable } from '@nestjs/common';
import { Connection, Repository } from 'typeorm';
import Product from '$database/entities/Product';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from '$shared/auth/auth.service';
import { Exception } from '$helpers/exception';
import { CommonStatus, ErrorCode, ProductStatus } from '$types/enums';
import OrderCart from '$database/entities/OrderCart';
import { AddProductsToCartDto } from './dto/AddProductToCart.dto';
import { GetOrderCartDto } from './dto/GetOrderCartDto.dto';
import { filterOrderCart } from '$helpers/utils';
import UserShop from '$database/entities/UserShop';
import User from '$database/entities/User';

@Injectable()
export class OrderCartService {
  constructor(
    private readonly connection: Connection,
    private readonly authService: AuthService,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(OrderCart)
    private readonly orderCartRepository: Repository<OrderCart>,
    @InjectRepository(UserShop)
    private readonly userShopRepository: Repository<UserShop>,
  ) {}

  async addProductsToCart(memberId: number, product: AddProductsToCartDto) {
    const productInDb = await this.productRepository.findOne({
      where: {
        id: product.productCode,
        status: ProductStatus.Active || ProductStatus.SoldOff,
      },
    });

    if (!!!productInDb) {
      throw new Exception(
        ErrorCode.Product_Not_Found,
        'Product is deleted! Please try another one!',
      );
    }
    if (productInDb.status == ProductStatus.SoldOff) {
      throw new Exception(
        ErrorCode.Product_Not_Found,
        'Product is sold off! Please try another!',
      );
    }

    if (productInDb.quantityInStock < product.quantityOrder) {
      throw new Exception(
        ErrorCode.Quantity_Invalid,
        'Quantity you want is invalid!',
      );
    }
    const addingProduct = {
      customerId: memberId,
      ...product,
    };

    const productInCart = await this.orderCartRepository.findOne({
      where: {
        customerId: memberId,
        productCode: product.productCode,
        status: CommonStatus.Active,
      },
    });
    if (!!productInCart) {
      productInCart.quantityOrder += product.quantityOrder;
      return this.orderCartRepository.save(productInCart);
    }

    return this.orderCartRepository.save(addingProduct);
  }

  async deleteProductFromCart(memberId: number, orderId: number) {
    const orderInCart = await this.orderCartRepository
      .createQueryBuilder('oc')
      .andWhere('oc.customerId = :memberId AND oc.id = :orderId', {
        memberId: memberId,
        orderId: orderId,
      })
      .getOne();

    if (!orderInCart) {
      throw new Exception(ErrorCode.Not_Found, 'This order not found!');
    }
    if (orderInCart.customerId !== memberId) {
      throw new Exception(
        ErrorCode.Unauthorized,
        'You are not author of this order!',
      );
    }

    return await this.orderCartRepository.save({
      ...orderInCart,
      status: CommonStatus.Inactive,
    });
  }

  async getAllOrderInCart(memberId: number, params: GetOrderCartDto) {
    const results = await this.productRepository
      .createQueryBuilder('p')
      .innerJoinAndMapOne('p.userShop', UserShop, 'us', 'us.id = p.sellerId')
      .innerJoinAndMapOne('us.user', User, 'u', 'u.id = us.owner_id')
      .innerJoinAndMapOne(
        'p.orderCart',
        OrderCart,
        'oc',
        'oc.productCode = p.id AND oc.customerId = :ocCustomerId AND oc.status = :ocStatus',
        {
          ocCustomerId: memberId,
          ocStatus: CommonStatus.Active,
        },
      )
      .select([
        'us.id',
        'us.shopName',
        'u.id',
        'u.image',
        'u.username',
        'p.id',
        'p.productName',
        'p.priceEach',
        'p.discount',
        'oc.orderId',
        'oc.quantityOrder',
      ])
      .getMany();
    return results;
  }

  async changeQuantityOrderOfProductInCart(
    memberId: number,
    productCode: number,
    quantity: number,
  ) {
    const productInDb = await this.productRepository.findOne(productCode);

    if (quantity > productInDb.quantityInStock) {
      throw new Exception(
        ErrorCode.Quantity_Invalid,
        'Your quantity is higher than shop has!',
      );
    }

    const productInCartInDb = await this.orderCartRepository
      .createQueryBuilder('oc')
      .innerJoinAndSelect('oc.product', 'product')
      .where(
        'oc.customer_id = :memberId AND oc.status = :status AND oc.productCode = :productCode',
        {
          memberId: memberId,
          productCode: productCode,
          status: ProductStatus.Active,
        },
      )
      .getOne();

    if (!!!productInCartInDb) {
      throw new Exception(
        ErrorCode.Product_Not_Found,
        'Product is not found or sold off!',
      );
    }
    if (productInCartInDb.product.quantityInStock < quantity) {
      throw new Exception(
        ErrorCode.Quantity_Invalid,
        'Quantity you want is invalid!',
      );
    }
    productInCartInDb.quantityOrder = quantity;
    return this.orderCartRepository.save(productInCartInDb);
  }
}
