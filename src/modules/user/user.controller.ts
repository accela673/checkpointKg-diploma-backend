import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from './services/user.service';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { LangRole } from './enums/lang.enum';

@ApiTags('Users for admin')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Get list of all users' })
  @Get()
  async getAll() {
    return await this.userService.getAllUsers();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  @Get('get/profile')
  async getProfile(@Req() req) {
    return await this.userService.get(+req.user.id);
  }

  @ApiOperation({ summary: 'Get one user by id' })
  @Get(':id')
  async getById(@Param('id') id: number) {
    return await this.userService.get(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Change user language' })
  @ApiBearerAuth()
  @Post(':id/:lang')
  async changeById(@Req() req, @Param('lang') lang: string) {
    const langEnum = this.userService.stringToEnum(
      LangRole,
      lang.toUpperCase(),
    );
    if (langEnum === undefined) {
      throw new BadRequestException('Invalid language');
    }
    return await this.userService.changeLang(req.user.id, langEnum);
  }

  @ApiOperation({ summary: 'Delete user by id' })
  @Delete(':id')
  async deleteById(@Param('id') id: number) {
    return await this.userService.deleteUser(id);
  }
}
