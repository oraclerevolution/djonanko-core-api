import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HelperModule } from './helper/helper.module';

@Module({
  imports: [HelperModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
