import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { Payload } from './interfaces/payload.interface';
import { UserService } from 'src/user/user.service';

const HEADER_AUTHENTICATION_TOKEN_KEY = 'authenticationtoken';
export const FULL_AUTH_GUARD = 'FULL_AUTH_GUARD';

@Injectable()
export class FullAuthStrategy extends PassportStrategy(
  Strategy,
  FULL_AUTH_GUARD,
) {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User) private readonly repository: Repository<User>,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromHeader(HEADER_AUTHENTICATION_TOKEN_KEY),
      ignoreExpiration: false,
      secretOrKey: 'secret',
    });
  }

  async validate(payload: Payload) {
    const user = await this.userService.getUserByPhoneNumber(payload.numero);

    if (!user) {
      throw new UnauthorizedException();
    }
    // delete user.password
    // delete user.salt
    return user;
  }
}
