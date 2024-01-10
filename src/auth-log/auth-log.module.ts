import { Module } from '@nestjs/common';
import { AuthLogController } from './auth-log.controller';
import { AuthLogService } from './auth-log.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthLog } from './entities/auth-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuthLog]),
  ],
  controllers: [AuthLogController],
  providers: [AuthLogService]
})
export class AuthLogModule {}
