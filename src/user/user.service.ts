import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { IsNull, Not, Repository, UpdateResult } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UserAuth } from './enums/user-auth.enum';
import * as phoneToken from 'generate-sms-verification-code';
import { ConfigService } from '@nestjs/config';
import { UserLoginDto } from './dto/user-login.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FavoriteOperator } from './interfaces/favorite-operator.interface';
import { UserType } from './enums/user-type.enum';
import { sendSms } from 'src/libs/sms.lib';
import { ReferralsService } from 'src/referrals/referrals.service';

@Injectable()
export class UserService {
  /**
   * Constructor function for the class.
   *
   * @param {Repository<User>} repository - The repository for the User entity.
   * @param {JwtService} jwtService - The JWT service.
   */
  constructor(
    @InjectRepository(User) private readonly repository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly referralsService: ReferralsService,
  ) {}

  async register(payload: CreateUserDto): Promise<User> {
    const user = this.repository.create({
      ...payload,
    });
    user.referralCode = this.generateReferralCode();
    user.salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(user.password, user.salt);
    if (payload.referralCode) {
      const host = await this.getUserByReferalCode(payload.referralCode);
      if (host) {
        await this.referralsService.createReferral({
          hostId: host.id,
          guessId: user.id,
        });
      }
    }

    try {
      await this.repository.save(user);
      const message =
        'Votre inscription sur Djonanko CI a bien été prise en compte. Merci de profiter pleinenement de nos services en toute sécurité.';
      const phoneNumber = user.numero;
      await sendSms({ phoneNumber, message });
      return user;
    } catch (error) {
      console.log('error', error);
      throw new Error('Something went wrong during registering user');
    }
  }

  async login(credentials: UserLoginDto): Promise<UserAuth> {
    const { numero, password } = credentials;
    //we verify if user exist
    const user = await this.repository
      .createQueryBuilder('user')
      .where('user.numero = :numero', { numero })
      .andWhere('user.status = :status', { status: true })
      .getOne();
    //if user doesn't exist, we throw an error
    if (!user) {
      throw new NotFoundException(
        "Connexion impossible, l'utilisateur n'existe pas",
      );
    }

    const hashedPassword = await bcrypt.hash(password, user.salt);
    if (hashedPassword === user.password) {
      const payload = {
        numero: user.numero,
        password: user.password,
      };

      const token = this.jwtService.sign(payload);
      delete user.salt;
      const otp = this.generateVerificationCode();
      if (otp !== 400) {
        const message = `Une tentative de connexion à votre compte vient d'être détectée. Veuillez saisir le code suivant : ${otp}. S'il ne s'agit pas de vous contactez le service support.`;
        const phoneNumber = user.numero;
        await sendSms({ phoneNumber, message });
        console.log('otp', otp);
        return {
          access_token: token,
          user,
          otp,
        };
      } else {
        throw new BadRequestException('Please retry login process');
      }
    } else {
      throw new UnauthorizedException(
        'Connexion impossible, vérifiez vos identifiants',
      );
    }
  }

  generateVerificationCode() {
    const optCode: number = phoneToken(4, { type: 'number' });
    if (String(optCode).length === 4) {
      return optCode;
    } else {
      return 400;
    }
  }

  /**
   * Génération d'un code unique, par exemple en utilisant une combinaison de chiffres et de lettres
   *
   * @return {string} the generated referral code
   */
  private generateReferralCode(): string {
    // Génération d'un code unique, par exemple en utilisant une combinaison de chiffres et de lettres
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const codeLength = 8;
    let referralCode = '';
    for (let i = 0; i < codeLength; i++) {
      referralCode += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }
    return referralCode;
  }

  async getUserByPhoneNumber(phoneNumber: string): Promise<User> {
    return await this.repository
      .createQueryBuilder('user')
      .where('user.numero = :phoneNumber', { phoneNumber })
      .getOne();
  }

  async verifyIfNumberExists(phoneNumber: string): Promise<number> {
    const contact = await this.repository.find({
      where: {
        numero: phoneNumber,
        status: true,
      },
    });
    if (contact) {
      console.log(contact);
      return 200;
    } else {
      return 404;
    }
  }

  async getUserById(id: number): Promise<User> {
    return await this.repository.findOne({
      where: {
        id,
        status: true,
      },
    });
  }

  async updateUser(id: number, user: UpdateUserDto): Promise<UpdateResult> {
    return await this.repository.update(id, user);
  }

  async getUsersPremiums(): Promise<User[]> {
    return await this.repository.find({
      where: {
        premium: true,
        premiumActivated: false,
        status: true,
      },
    });
  }

  async changePremiumStatus() {
    return await this.repository.find({
      where: {
        premium: true,
        status: true,
      },
    });
  }

  async updateUserMobileMoney(id: number, payload: UpdateUserDto) {
    const user = await this.repository.update(id, {
      ...payload,
    });

    return user;
  }

  /**
   * Asynchronously verifies the user's password.
   *
   * @param {number} id - The ID of the user.
   * @param {string} password - The password to verify.
   * @return {Promise<{status: boolean}>} - The status of the verification.
   */
  async verifyUserPassword(id: number, payload: UpdateUserDto) {
    const user = await this.repository.findOne({
      where: {
        id,
        status: true,
      },
    });
    const hashedPassword = await bcrypt.hash(payload.password, user.salt);
    if (hashedPassword === user.password) {
      return {
        status: true,
      };
    } else {
      return {
        status: false,
      };
    }
  }

  /**
   * Updates the password of a user.
   *
   * @param {number} id - The ID of the user.
   * @param {UpdateUserDto} payload - The payload containing the new password.
   * @return {Promise<void>} - A promise that resolves when the password is updated.
   */
  async updateUserPassword(id: number, payload: UpdateUserDto) {
    const { password } = payload;

    const user = await this.repository.findOne({
      where: {
        id,
        status: true,
      },
    });
    const hashedPassword = await bcrypt.hash(password, user.salt);
    return await this.repository.update(id, {
      password: hashedPassword,
    });
  }

  async getUserFavoriteOperator(id: number): Promise<FavoriteOperator> {
    const user = await this.repository.findOne({
      where: {
        id,
        status: true,
      },
    });
    return {
      favoriteOperator: user.favoriteOperator,
      phoneNumber: user.numero,
    };
  }

  async getUserMobileMoney(id: number, mobileMoney: string): Promise<string> {
    const user = await this.repository.findOne({
      where: {
        id,
        status: true,
      },
    });

    if (mobileMoney === 'Orange') {
      return user.orangeMoney;
    }

    if (mobileMoney === 'Wave') {
      return user.waveMoney;
    }

    if (mobileMoney === 'Mtn') {
      return user.mtnMoney;
    }

    if (mobileMoney === 'Moov') {
      return user.moovMoney;
    }
  }

  async getReceiverMobileMoney(
    phoneNumber: string,
    mobileMoney: string,
  ): Promise<string> {
    const user = await this.getUserByPhoneNumber(phoneNumber);

    if (mobileMoney === 'Orange') {
      return user.orangeMoney;
    }

    if (mobileMoney === 'Wave') {
      return user.waveMoney;
    }

    if (mobileMoney === 'Mtn') {
      return user.mtnMoney;
    }

    if (mobileMoney === 'Moov') {
      return user.moovMoney;
    }
  }

  async getCommercant(phoneNumber: string): Promise<User> {
    const commercant = await this.repository.findOne({
      where: {
        numero: phoneNumber,
        userType: UserType.COMMERCANT,
        status: true,
      },
    });

    return commercant;
  }

  async getAllUsersPushTokens(): Promise<string[]> {
    const users = await this.repository.find({
      where: {
        expoPushToken: Not(IsNull()),
        status: true,
      },
    });
    const usersTokens = users.map((user) => user.expoPushToken);
    return usersTokens;
  }

  async getUserByReferalCode(code: string): Promise<User> {
    const user = await this.repository.findOne({
      where: {
        referralCode: code,
        status: true,
      },
    });
    if (user) {
      return user;
    }
  }

  async getReferralPointsByUserId(id: number): Promise<string> {
    const user = await this.getUserById(id);
    const referalsPoints = user.referralAmountToPoint;
    return referalsPoints;
  }

  async getAllUsers(): Promise<User[]> {
    return await this.repository.find({
      where: {
        status: true,
      },
    });
  }

  async resendOtp(number: string): Promise<any> {
    const user = await this.getUserByPhoneNumber(number);
    const otp = this.generateVerificationCode();
    if (otp !== 400) {
      const message = `Une tentative de connexion à votre compte vient d'être détectée. Veuillez saisir le code suivant : ${otp}. S'il ne s'agit pas de vous contactez le service support.`;
      const phoneNumber = user.numero;
      await sendSms({ phoneNumber, message });
      console.log('otp', otp);
      return {
        otp,
      };
    } else {
      throw new BadRequestException('Please retry login process');
    }
  }
}
