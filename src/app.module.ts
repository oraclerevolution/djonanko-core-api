import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HelperModule } from './helper/helper.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransfertModule } from './transfert/transfert.module';
import { HistoriquesModule } from './historiques/historiques.module';
import { MarchandsModule } from './marchands/marchands.module';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CategorieMarchandsModule } from './categorie-marchands/categorie-marchands.module';
import { PaiementModule } from './paiement/paiement.module';
import { CompteCollecteModule } from './compte-collecte/compte-collecte.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CompteReservationModule } from './compte-reservation/compte-reservation.module';
import { AuthLogModule } from './auth-log/auth-log.module';
import { PosModule } from './pos/pos.module';
import { EmployeeModule } from './employee/employee.module';
import { TransactionsModule } from './transactions/transactions.module';
import { ReferralsModule } from './referrals/referrals.module';
import { ForgetPasswordModule } from './forget-password/forget-password.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.TYPEORM_HOST,
      port: Number(process.env.TYPEORM_PORT),
      username: process.env.TYPEORM_USERNAME,
      password: process.env.TYPEORM_PASSWORD,
      database: process.env.TYPEORM_DATABASE,
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    ScheduleModule.forRoot(),
    MulterModule.register({
      dest: './uploads',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
    }),
    HelperModule,
    UserModule,
    TransfertModule,
    HistoriquesModule,
    MarchandsModule,
    CategorieMarchandsModule,
    PaiementModule,
    CompteCollecteModule,
    CompteReservationModule,
    AuthLogModule,
    PosModule,
    EmployeeModule,
    TransactionsModule,
    ReferralsModule,
    ForgetPasswordModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
