import { Module } from '@nestjs/common';
import { MarchandsController } from './marchands.controller';
import { MarchandsService } from './marchands.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Marchands } from './entities/marchands.entity';
import { FullAuthStrategy } from 'src/full-auth-guard/full-auth.strategy';
import { User } from 'src/user/entities/user.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Marchands, User
    ]),
    UserModule
  ],
  controllers: [MarchandsController],
  providers: [MarchandsService, FullAuthStrategy],
})
export class MarchandsModule {}
