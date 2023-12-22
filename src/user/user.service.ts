import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { FindConditions, Repository, UpdateResult, } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UserAuth } from './enums/user-auth.enum';
import * as phoneToken from 'generate-sms-verification-code';
import { SendSmsDto } from './dto/send-sms.dto';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { AuthType, Infobip } from "@infobip-api/sdk"
import { UserLoginDto } from './dto/user-login.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateMobileMoneyDto } from './dto/update-mobile-money.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

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
        private readonly configService: ConfigService
    ) { }

    async register(payload: CreateUserDto): Promise<User> {
        const user = this.repository.create({
            ...payload,
        })
        user.salt = await bcrypt.genSalt()
        user.password = await bcrypt.hash(user.password, user.salt)

        try {
            await this.repository.save(user)
            const message = "Votre inscription sur Djonanko CI a bien été prise en compte. Merci de profiter pleinenement de nos services en toute sécurité."
            const phoneNumber = user.numero
            await this.sendSMSToUser({ phoneNumber, message })
            return user
        } catch (error) {
            console.log(error)
            throw new Error("Something went wrong during registering user")
        }
    }

    async login(credentials: UserLoginDto): Promise<UserAuth> {
        const { numero, password } = credentials
        //we verify if user exist
        const user = await this.repository.createQueryBuilder("user").where("user.numero = :numero", { numero }).getOne()
        //if user doesn't exist, we throw an error
        if (!user) {
            throw new NotFoundException("Connexion impossible, l'utilisateur n'existe pas")
        }

        const hashedPassword = await bcrypt.hash(password, user.salt)
        if (hashedPassword === user.password) {
            const payload = {
                numero: user.numero,
                password: user.password,
            }

            const token = this.jwtService.sign(payload)
            delete user.salt
            const otp = this.generateVerificationCode()
            const message = `Une tentative de connexion à votre compte vient d'être détectée. Veuillez saisir le code suivant : ${otp}. S'il ne s'agit pas de vous contactez le service support.`
            const phoneNumber = user.numero
            await this.sendSMSToUser({ phoneNumber, message })
            return {
                access_token: token,
                user,
                otp
            }
        } else {
            throw new UnauthorizedException("Connexion impossible, vérifiez vos identifiants")
        }
    }

    generateVerificationCode() {
        const optCode:  number = phoneToken(4, { type: 'number' })
        if(String(optCode).length === 4){
            return optCode
        }else{
            throw Error('Please retry login process')
        }
    }

    async getUserByPhoneNumber(phoneNumber: string): Promise<User> {
        return await this.repository.createQueryBuilder("user").where("user.numero = :phoneNumber", { phoneNumber }).getOne()
    }

    async getUserById(id: number): Promise<User> {
        return await this.repository.findOne(id)
    }

    async updateUser(id: number, user: UpdateUserDto,): Promise<UpdateResult> {
        return await this.repository.update(id, user)
    }

    async sendSMSToUser(payload: SendSmsDto): Promise<any> {
        const { phoneNumber, message } = payload
        let infobip = new Infobip({
            baseUrl: this.configService.get<string>('INFOBIP_BASE_URL'),
            apiKey: this.configService.get<string>('INFOBIP_API_KEY'),
            authType: AuthType.ApiKey
        })

        let response = await infobip.channels.sms.send({
            messages: [
                {
                    "destinations": [
                        {
                            "to": `+225${phoneNumber}`
                        }
                    ],
                    "from": "Djonanko CI",
                    "text": message
                }
            ]
        })

        return response
    }

    async getUsersPremiums(): Promise<User[]> {
        return await this.repository.find({
            where: {
                premium: true,
                premiumActivated: false
            }
        })
    }

    async changePremiumStatus() {
        return await this.repository.find({
            where: {
                premium: true
            }
        })
    }

    async updateUserMobileMoney(id: number, payload: UpdateMobileMoneyDto) {
        const user = await this.repository.update(id, {
            waveMoney: payload.waveMoney,
            orangeMoney: payload.orangeMoney,
            mtnMoney: payload.mtnMoney,
            moovMoney: payload.moovMoney
        })

        return user
    }

    /**
     * Asynchronously verifies the user's password.
     *
     * @param {number} id - The ID of the user.
     * @param {string} password - The password to verify.
     * @return {Promise<{status: boolean}>} - The status of the verification.
     */
    async verifyUserPassword(id: number, payload: UpdateUserDto) {
        const user = await this.repository.findOne(id)
        const hashedPassword = await bcrypt.hash(payload.password, user.salt)
        if(hashedPassword === user.password){
            
            return {
                status: true
            }
        }else{
            return {
                status: false
            }
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
        const { password } = payload

        const user = await this.repository.findOne(id)
        const hashedPassword = await bcrypt.hash(password, user.salt)
        return await this.repository.update(id, {
            password: hashedPassword
        })
    }

    async getUserMobileMoney(id: number, mobileMoney: string): Promise<string> {
        const user = await this.repository.findOne(id)
        
        if(mobileMoney === "Orange"){
            return user.orangeMoney
        }

        if(mobileMoney === "Wave"){
            return user.waveMoney
        }

        if(mobileMoney === "Mtn"){
            return user.mtnMoney
        }

        if(mobileMoney === "Moov"){
            return user.moovMoney
        }
    }
}
