import { Injectable } from '@nestjs/common';
import {
  IUser,
  IToken,
  IPayload,
  IUserLogin,
  IInputChangePassword,
  IRefreshTokenPakage,
  IPrePayload,
} from '$types/interfaces';
import { Connection, Repository, createQueryBuilder } from 'typeorm';
import User from '$database/entities/User';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from '$shared/auth/auth.service';
import { compare, hash } from 'bcrypt';
import { Exception, Unauthorized } from '$helpers/exception';
import { ErrorCode } from '$types/enums';
import config from '$config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ClientAuthService {
  constructor(
    private readonly connection: Connection,
    private readonly authService: AuthService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  //
  async signUp(user: IUser): Promise<IUser> {
    return await this.connection.transaction(async (transaction) => {
      const userRepository = transaction.getRepository(User);

      const isEmailExists = await this.isEmailExists(
        user.email,
        userRepository,
      );
      if (isEmailExists)
        throw new Exception(
          ErrorCode.Email_Already_Exist,
          'Email alredy exist. Chose an other one!',
        );

      user.password = await hash(user.password, config.BCRYPT_HASH_ROUNDS);
      const userSave = await userRepository.save(user);
      return userSave;
    });
  }

  async signIn(user: IUserLogin) {
    const hasEmail = await this.userRepository
      .createQueryBuilder('q')
      .innerJoinAndSelect('q.role', 'role')
      .where({ email: user.email })
      .getOne();
    if (!hasEmail)
      throw new Exception(
        ErrorCode.Not_Found,
        "Email didn't exist. Please sign in first!",
      );

    const isMatched = await compare(user.password, hasEmail.password);
    if (!isMatched)
      throw new Exception(
        ErrorCode.Email_Or_Password_Not_valid,
        'Password is incorrect. Please try again!',
      );

    const refreshTokenExpired = await this.authService.verifyRefreshToken(
      hasEmail.refreshToken,
      this.userRepository,
    );
    let { email, id, ...account } = hasEmail;
    const payload = {
      id: id,
      role: hasEmail.role.roleName,
    };
    const accessToken = this.authService.generateAccessToken(payload);

    if (refreshTokenExpired) {
      const tokens = {
        accessToken: accessToken,
        refreshToken: hasEmail.refreshToken,
      };
      return tokens;
    }
    const refreshToken = this.authService.generateRefreshToken(payload);
    await this.userRepository.update(
      { email: email },
      { refreshToken: refreshToken },
    );
    const tokens = {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
    return tokens;
  }

  async isEmailExists(
    email: string,
    userRepository?: Repository<User>,
  ): Promise<boolean> {
    userRepository = userRepository || this.userRepository;

    const isExist = await userRepository.findOne({
      where: { email },
      select: ['id'],
    });
    return !!isExist;
  }

  async changePassword(
    info: IInputChangePassword,
    user: IPrePayload,
  ): Promise<IPrePayload> {
    const userInDb = await this.userRepository.findOne({
      where: { id: user.id },
    });

    const isMatchedPassword = await compare(
      info.oldPassword,
      userInDb.password,
    );
    if (!isMatchedPassword)
      throw new Exception(
        ErrorCode.Old_Password_Incorrect,
        'Old password you typed is wrong! Please try again!',
      );

    const newPassword = await hash(info.newPassword, config.BCRYPT_HASH_ROUNDS);
    await this.userRepository.update(
      { email: userInDb.email },
      { password: newPassword },
    );

    return user;
  }

  async refreshAccessToken(params: IRefreshTokenPakage) {
    const userInfo = (await this.authService.verifyRefreshToken(
      params.refreshToken,
      this.userRepository,
    )) as any;
    if (!userInfo)
      throw new Exception(ErrorCode.Token_Not_Exist, 'Your Token is invalid!');
    const { iat, exp, ...payload } = userInfo;
    const accessToken = this.authService.generateAccessToken(payload as any);
    return accessToken;
  }
}
