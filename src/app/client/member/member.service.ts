import { Injectable } from '@nestjs/common';
import { IPrePayload } from '$types/interfaces';
import { Connection, Repository, createQueryBuilder } from 'typeorm';
import User from '$database/entities/User';
import { InjectRepository } from '@nestjs/typeorm';
import { Exception, Unauthorized } from '$helpers/exception';
import { CommonStatus, ErrorCode } from '$types/enums';
import { RegisterShopDto } from './dto/RegisterShopDto.dto';
import UserShop from '$database/entities/UserShop';
import Order from '$database/entities/Order';
import OrderCart from '$database/entities/OrderCart';
import Product from '$database/entities/Product';
import Like from '$database/entities/Like';
import { EditPhoneDto } from './dto/EditPhone.dto';

@Injectable()
export class MemberService {
  constructor(
    private readonly connection: Connection,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserShop)
    private readonly userShopRepository: Repository<UserShop>,
  ) {}

  async getPersonalInfo(user: IPrePayload) {
    const hasEmail = await this.userRepository
      .createQueryBuilder('u')
      .leftJoinAndMapOne(
        'u.shop',
        UserShop,
        'us',
        'us.ownerId = u.id AND us.status = :usStatus',
        { usStatus: CommonStatus.Active },
      )
      .select([
        'u.id',
        'u.email',
        'u.username',
        'u.image',
        'u.phone',
        'u.gender',
        'u.dateOfBirth',
        'us.id',
        'us.shopName',
        'us.address',
        'us.shopTypeId',
      ])
      .where('u.id = :memberId', { memberId: user.id })
      .getOne();
    return hasEmail;
  }

  async registerShop(memberId: number, info: RegisterShopDto) {
    const userHaveShop = await this.userShopRepository.findOne({
      where: { ownerId: memberId },
    });
    if (!!userHaveShop) {
      throw new Exception(
        ErrorCode.Already_Register_Shop,
        'You have registered shop!',
      );
    }

    return this.userShopRepository.save(info);
  }

  async editPhone(memberId: number, body: EditPhoneDto) {
    const hasPhone = await this.userRepository.findOne({
      phone: body.phone,
    });
    if (hasPhone) {
      throw new Exception(
        ErrorCode.Resource_Already_Exists,
        'This phone existed!',
      );
    }

    return this.userRepository.update(
      {
        id: memberId,
      },
      { phone: body.phone },
    );
  }
}
