import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserType } from "../enums/user-type.enum";

@Entity({
    name: 'users'
})

export class User {
    @PrimaryGeneratedColumn("increment")
    id: number;
    
    @Column({nullable: false})
    fullname: string;

    @Column({unique: true, nullable: false})
    numero: string;

    @Column({unique: true, nullable: true})
    email: string

    @Column({default: '0'})
    solde: string

    @Column()
    password: string

    @Column({nullable: true, default: UserType.USER, enum: UserType})
    userType: UserType

    @Column({default: false})
    isVerified: boolean

    @Column({default: true})
    isActive: boolean

    @Column({default: false})
    isActive2fa: boolean

    @Column({nullable: true})
    isMerchant: boolean

    @Column()
    salt: string

    @Column({nullable: true,unique: true, name: 'wave_money'})
    waveMoney: string

    @Column({nullable: true,unique: true, name: 'orange_money'})
    orangeMoney: string

    @Column({nullable: true,unique: true, name: 'mtn_money'})
    mtnMoney: string

    @Column({nullable: true,unique: true, name: 'moov_money'})
    moovMoney: string

    @Column({nullable: true, enum: [1, 2, 3, 4], name:'favorite_operator'})
    favoriteOperator: number

    @Column({default: false})
    alreadyLogged: boolean

    @Column({nullable: false, default: false})
    premium: boolean

    @Column({nullable: true, default: false})
    premiumActivated: boolean

    @Column({nullable: false, default: 200000})
    plafonds: number

    @Column({nullable: false, default: 300000, name: 'cumul_mensuel'})
    cumulMensuel: number

    @Column({nullable: true, default: 300000, name: 'cumul_mensuel_restant'})
    cumulMensuelRestant: number

    @Column({nullable: true})
    referralCode: string

    @Column({nullable: true, default: '0', name: 'referral_amount_to_point'})
    referralAmountToPoint: string

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

}