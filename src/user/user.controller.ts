import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UserLoginDto } from './dto/user-login.dto';
import { UserAuth } from './enums/user-auth.enum';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService
    ) {}

    @Post('register')
    async register(
        @Body() payload: CreateUserDto
    ): Promise<User> {
        return await this.userService.register(payload)
    }

    @Post('login')
    async login(
        @Body() payload: UserLoginDto
    ): Promise<UserAuth> {
        return await this.userService.login(payload)
    }

    @Get('user-infos-by-number')
    async userInfos(
        @Query('phoneNumber') phoneNumber: string
    ): Promise<User> {
        return await this.userService.getUserByPhoneNumber(phoneNumber)
    }

    @Patch('update-user')
    async updateUser(
        @Body() payload: UpdateUserDto,
        @Query('id') id: number
    ){
        return await this.userService.updateUser(id, payload)
    }
}
