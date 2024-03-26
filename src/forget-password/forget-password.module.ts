import { Module } from '@nestjs/common';
import { ForgetPasswordController } from './forget-password.controller';
import { ForgetPasswordService } from './forget-password.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ForgetPassword } from './entities/forget-password.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ForgetPassword]),
  ],
  controllers: [ForgetPasswordController],
  providers: [ForgetPasswordService],
  exports: [ForgetPasswordService]
})
export class ForgetPasswordModule {}
