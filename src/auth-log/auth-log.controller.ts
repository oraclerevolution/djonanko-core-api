import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AuthLogService } from './auth-log.service';
import { CreateAuthLogDto } from './dto/create-auth-log.dto';
import { AuthLog } from './entities/auth-log.entity';

@Controller('auth-log')
export class AuthLogController {
    constructor(
        private readonly authLogService: AuthLogService
    ) {}

    @Post()
    async createAuthLog(
        @Body() payload: CreateAuthLogDto
    ): Promise<AuthLog> {
        return await this.authLogService.createAuthLog(payload);
    }

    @Get()
    async getAUserAuthLogs(
        @Query("userId") userId: number
    ): Promise<AuthLog[]> {
        return await this.authLogService.getAUserAuthLogs(userId);
    }
}
