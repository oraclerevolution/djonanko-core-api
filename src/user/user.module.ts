import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { FullAuthStrategy } from 'src/full-auth-guard/full-auth.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({defaultStrategy: 'jwt'}),
    JwtModule.register({
      secret: 'secret',
      signOptions: {
        expiresIn: '30d'
      }
    }),
    JwtModule
  ],
  controllers: [UserController],
  providers: [
    UserService,
    FullAuthStrategy
  ],
  exports: [UserService]
})
export class UserModule {}
