import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AuthLog } from './entities/auth-log.entity';
import { CreateAuthLogDto } from './dto/create-auth-log.dto';

@Injectable()
export class AuthLogService {
    constructor(
        private readonly repository: Repository<AuthLog>
    ) {}

    /**
     * Creates an authentication log for a user.
     *
     * @param {number} userId - The ID of the user.
     * @param {CreateAuthLogDto} payload - The data for creating the authentication log.
     * @return {Promise<AuthLog>} A promise that resolves to the created authentication log.
     */
    async createAuthLog(payload: CreateAuthLogDto): Promise<AuthLog> {
        const authLog = new AuthLog();
        authLog.phoneType = payload.phoneType;
        authLog.phoneModel = payload.phoneModel;
        authLog.modelId = payload.modelId;
        authLog.userId = payload.userId;

        return await this.repository.save(authLog);
    }

    /**
     * Retrieves the authentication logs for a specific user.
     *
     * @param {number} userId - The ID of the user.
     * @return {Promise<AuthLog[]>} A promise that resolves to an array of authentication logs.
     */
    async getAUserAuthLogs(userId: number): Promise<AuthLog[]> {
        return await this.repository.find({
            where: {
                userId
            }
        })
    }
}
