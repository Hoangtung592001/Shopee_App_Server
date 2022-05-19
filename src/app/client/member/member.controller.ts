import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { MemberService } from './member.service';
import { IUserReq } from '$types/interfaces';
import { UserData } from '$core/decorators/user.decorator';
import { RegisterShopDto } from './dto/RegisterShopDto.dto';
import { EditPhoneDto } from './dto/EditPhone.dto';
@Controller('member')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}
  @Get('get-personal-info')
  getPersonalInfo(@Req() req: IUserReq) {
    const { tokenType, ...user } = req.user;
    return this.memberService.getPersonalInfo(user);
  }

  @Post('register-shop')
  registerShop(
    @Body() body: RegisterShopDto,
    @UserData() member: Express.User,
  ) {
    return this.memberService.registerShop(member.id, body);
  }

  @Post('edit-phone')
  editPhone(@Body() body: EditPhoneDto, @UserData() member: Express.User) {
    return this.memberService.editPhone(member.id, body);
  }
}
