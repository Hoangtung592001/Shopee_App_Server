import { Injectable } from '@nestjs/common';
import {
  IInfoProduct,
  IPrePayload,
  IProduct,
  IProductFull,
} from '$types/interfaces';
import { Connection, Repository, getConnection, Like as like } from 'typeorm';
import Product from '$database/entities/Product';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from '$shared/auth/auth.service';
import { Exception } from '$helpers/exception';
import { CommonStatus, ErrorCode, ProductStatus } from '$types/enums';
import OrderCart from '$database/entities/OrderCart';
import {
  FindAllMemberModelDto,
  loadMoreFindAllMemberModelDto,
  TypeProducts,
} from './dto/GetAllProductsDto';
import UserShop from '$database/entities/UserShop';
import User from '$database/entities/User';
import ProductRecent from '$database/entities/ProductRecent';
import Judge from '$database/entities/Judge';
import Like from '$database/entities/Like';
import Image from '$database/entities/Image';
import Order from '$database/entities/Order';
import OrderDetail from '$database/entities/OrderDetail';
import { number } from 'joi';
import { getManager } from 'typeorm';

const camelcaseKeys = require('camelcase-keys');
@Injectable()
export class ProductService {
  constructor(
    private readonly connection: Connection,
    private readonly authService: AuthService,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(OrderCart)
    private readonly orderCartRepository: Repository<OrderCart>,
    @InjectRepository(UserShop)
    private readonly userShopRepository: Repository<UserShop>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ProductRecent)
    private readonly productRecentRepository: Repository<ProductRecent>,
    @InjectRepository(Judge)
    private readonly judgeRepository: Repository<Judge>,
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
  ) {}

  // async getAllProducts(params: FindAllMemberModelDto) {
  //   const queryBuilder = this.productRepository
  //     .createQueryBuilder('p')
  //     .where('p.status != 0');
  //   const [results, totalItems] = await queryBuilder
  //     .skip(params.skip)
  //     .take(params.pageSize)
  //     .getManyAndCount();
  //   return returnPaging(results, totalItems, params);
  // }

  async getAllProducts(params: TypeProducts) {
    // const queryRunner = getConnection().createQueryRunner();
    // await queryRunner.connect();
    // let query =
    //   'SELECT p.*, AVG(j.stars) as rating FROM product p LEFT JOIN judge j ON p.id = j.product_code GROUP BY p.id';
    // if (params.takeAfter) {
    //   query = query + ' WHERE p.id < ' + params.takeAfter;
    // }
    // query += ' ORDER BY p.id DESC';
    // if (params.pageSize) {
    //   query = query + ' LIMIT ' + params.pageSize;
    // }
    // const results = await queryRunner.query(query);
    const results = this.productRepository
      .createQueryBuilder('p')
      .leftJoinAndMapMany('p.judges', Judge, 'j', 'p.id = j.productCode');

    if (params.type > 1) {
      results.andWhere('p.productLine = :productLine', {
        productLine: params.type,
      });
    }

    return results.orderBy('p.id', 'DESC').getMany();
  }

  async addProduct(product: IProduct, user: IPrePayload) {
    const userHaveShop = await this.userShopRepository.findOne({
      where: { ownerId: user.id },
    });
    if (!!!userHaveShop) {
      throw new Exception(
        ErrorCode.Not_Register_Shop,
        "You don' have shop now! Please register first!",
      );
    }
    const savingProduct = {
      ...product,
      sellerId: userHaveShop.id,
    };
    const savedProduct = await this.productRepository.save(savingProduct);
    return savedProduct;
  }

  async getProduct(id: number) {
    const queryBuilder = await this.productRepository
      .createQueryBuilder('p')
      .innerJoinAndMapOne('p.shop', UserShop, 'us', 'p.sellerId = us.id')
      .leftJoinAndMapMany('p.judges', Judge, 'j', 'j.productCode = p.id')
      .leftJoinAndMapOne('j.user', User, 'u', 'u.id = j.memberId')
      .leftJoinAndMapMany(
        'p.images',
        Image,
        'i',
        'i.productCode = p.id AND i.status = :iStatus',
        { iStatus: CommonStatus.Active },
      )
      .leftJoinAndMapMany(
        'us.products',
        Product,
        'p1',
        'p1.sellerId = us.id AND p1.status = :p1Status',
        { p1Status: ProductStatus.Active },
      )
      .leftJoinAndMapMany('p1.judges', Judge, 'j1', 'j1.productCode = p1.id')
      .select([
        'p.id',
        'p.productName',
        'p.productLine',
        'p.quantityInStock',
        'p.priceEach',
        'p.image',
        'p.description',
        'p.origin',
        'p.discount',
        'p.soldQuantity',
        'us.id',
        'us.shopName',
        'j.id',
        'j.content',
        'j.stars',
        'u.id',
        'u.email',
        'u.username',
        'u.image',
        'i.id',
        'i.name',
        'p1.id',
        'p1.image',
        'p1.productName',
        'p1.soldQuantity',
        'p1.priceEach',
        'j1.id',
        'j1.stars',
      ])
      .orderBy('p1.soldQuantity', 'DESC')
      .where('p.id = :pId', { pId: id })
      .getOne();
    return queryBuilder;
  }

  async getProducByUser(userId: number, productId: number) {
    const queryBuilder = this.productRepository
      .createQueryBuilder('p')
      .innerJoinAndMapOne('p.shop', UserShop, 'us', 'p.sellerId = us.id')
      .leftJoinAndMapMany('p.judges', Judge, 'j', 'j.productCode = p.id')
      .innerJoinAndMapOne('j.user', User, 'u', 'u.id = j.memberId')
      .leftJoinAndMapOne(
        'p.like',
        Like,
        'l',
        'l.productCode = p.id AND l.memberId = :lMemberId',
        { lMemberId: userId },
      )
      .select([
        'p.id',
        'p.productName',
        'p.productLine',
        'p.quantityInStock',
        'p.priceEach',
        'p.image',
        'p.description',
        'p.origin',
        'p.discount',
        'p.soldQuantity',
        'us.id',
        'us.shopName',
        'j.id',
        'j.content',
        'j.stars',
        'u.id',
        'u.email',
        'u.username',
        'u.image',
        'l.id',
      ])
      .where('p.id = :pId', { pId: productId })
      .orderBy('p.id', 'DESC')
      .getOne();
    return await queryBuilder;
  }

  async deleteProduct(id: number, user: IPrePayload) {
    try {
      const userHaveShop = await this.userShopRepository.findOne({
        where: { ownerId: user.id },
      });
      if (!!!userHaveShop) {
        throw new Exception(
          ErrorCode.Not_Register_Shop,
          "You don' have shop now! Please register first!",
        );
      }

      const productInDb = await this.productRepository.findOne(id);

      if (productInDb.sellerId != userHaveShop.id) {
        throw new Exception(
          ErrorCode.Forbidden_Resource,
          'You are not owner of this products',
        );
      }

      await this.productRepository.update(
        { id: productInDb.id },
        { status: ProductStatus.Deleted },
      );

      return {
        success: true,
      };
    } catch (error) {
      throw new Exception(
        ErrorCode.Unknown_Error,
        error?.message || 'Unknown_Error',
      );
    }
  }

  async changeInfoProduct(
    productId: number,
    productInfo: IInfoProduct,
    user: IPrePayload,
  ) {
    try {
      const userHaveShop = await this.userShopRepository.findOne({
        where: { ownerId: user.id },
      });
      if (!!!userHaveShop) {
        throw new Exception(
          ErrorCode.Not_Register_Shop,
          "You don' have shop now! Please register first!",
        );
      }

      const productInDb = await this.productRepository.findOne(productId);

      if (productInDb.sellerId != userHaveShop.id) {
        throw new Exception(
          ErrorCode.Forbidden_Resource,
          'You are not owner of this products',
        );
      }

      const product = (await this.productRepository.update(
        { id: productId },
        productInfo,
      )) as unknown as IProductFull;
      return product;
    } catch (error) {
      throw new Exception(
        ErrorCode.Unknown_Error,
        error?.message || 'Unknown_Error',
      );
    }
  }

  async recentVisited(memberId: number, productCode: number) {
    const productInDb = await this.productRepository.findOne({
      where: { id: productCode },
    });
    if (!!!productInDb || productInDb.status == ProductStatus.Deleted) {
      throw new Exception(
        ErrorCode.Not_Found,
        'Product you visited is not found!',
      );
    }

    return this.productRecentRepository.save({
      visitorId: memberId,
      productCode: productCode,
    });
  }

  async getRecentVisitedProduct(
    memberId: number,
    params: loadMoreFindAllMemberModelDto,
  ) {
    const queryBuilder = this.productRepository
      .createQueryBuilder('p')
      .innerJoinAndMapOne(
        'p.judges',
        ProductRecent,
        'pr',
        'p.id = pr.productCode',
      )
      .where('pr.visitorId = :prMemberId  AND p.status = :pStatus', {
        prMemberId: memberId,
        pStatus: ProductStatus.Active,
      })
      .select([
        'pr.id',
        'pr.productCode',
        'p.id',
        'p.productName',
        'p.discount',
        'p.soldQuantity',
        'p.priceEach',
        'p.origin',
        'p.image',
      ]);

    const results = await queryBuilder.orderBy('pr.id', 'DESC').getMany();
    return results;
  }

  async getLikedProducts(memberId: number) {
    const results = await this.productRepository
      .createQueryBuilder('p')
      .innerJoinAndMapMany(
        'p.likes',
        Like,
        'l',
        'l.productCode = p.id AND p.status = :pStatus',
        { pStatus: ProductStatus.Active },
      )
      .innerJoinAndMapOne(
        'l.user',
        User,
        'u',
        'u.id = l.memberId AND u.status = :uStatus AND u.id = :uMemberId',
        {
          uStatus: CommonStatus.Active,
          uMemberId: memberId,
        },
      )
      .select([
        'p.id',
        'p.productName',
        'p.priceEach',
        'p.soldQuantity',
        'p.discount',
        'p.image',
      ])
      .getMany();
    return results;
  }

  async getInfoOrder(memberId: number) {
    return this.userRepository
      .createQueryBuilder('u')
      .leftJoinAndMapOne(
        'u.shop',
        UserShop,
        'us',
        'us.ownerId = u.id AND us.status = :usStatus',
        { usStatus: CommonStatus.Active },
      )
      .leftJoinAndMapMany('u.orders', Order, 'o', 'o.customerId = u.id')
      .leftJoinAndMapMany(
        'o.orderDetails',
        OrderDetail,
        'od',
        'od.orderId = o.id',
      )
      .innerJoinAndMapOne(
        'od.product',
        Product,
        'p',
        'p.id = od.productCode AND p.status = :pStatus',
        { pStatus: ProductStatus.Active },
      )
      .innerJoinAndMapOne(
        'p.shop',
        UserShop,
        'us1',
        'us1.id = p.sellerId AND us1.status = :us1Status',
        { us1Status: CommonStatus.Active },
      )
      .select([
        'u.id',
        'u.email',
        'u.username',
        'u.image',
        'us.id',
        'us.shopName',
        'o.orderedAt',
        'o.deletedAt',
        'o.deliveredAt',
        'o.shippedAt',
        'o.address',
        'o.status',
        'od.id',
        'od.quantityOrder',
        'od.priceEach',
        'p.id',
        'p.productName',
        'p.quantityInStock',
        'p.priceEach',
        'p.image',
        'p.origin',
        'p.discount',
        'p.soldQuantity',
        'us1.id',
        'us1.shopName',
      ])
      .where('u.id = :memberId', { memberId: memberId })
      .getOne();
  }

  async listSearchProducts(keywords: string) {
    const entityManager = getManager();
    const query = `SELECT DISTINCT product_name as productName FROM product WHERE product_name LIKE "%${keywords}%"`;
    return entityManager.query(query, []);
  }

  async searchProducts(keywords: string) {
    return this.productRepository.find({
      where: {
        productName: keywords,
      },
    });
  }
}
