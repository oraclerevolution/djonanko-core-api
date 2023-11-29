import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HelperService {
    public static getConfigBoolValue(
        configService: ConfigService,
        key: string
    ):boolean {
        const rawConfigValue = configService.get<boolean>(key);
        let configValue = false;
        if(typeof rawConfigValue === 'boolean'){
            configValue = rawConfigValue;
        }
        if(typeof rawConfigValue === 'string'){
            const sslString = rawConfigValue as string;
            configValue = sslString === 'true';
        }

        return configValue
    }
}
