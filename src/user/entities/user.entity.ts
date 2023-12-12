import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

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

    @Column({default: false})
    isVerified: boolean

    @Column({default: false})
    isActive2fa: boolean

    @Column()
    salt: string

    @Column({nullable: true, name: 'wave_money'})
    waveMoney: string

    @Column({nullable: true, name: 'orange_money'})
    orangeMoney: string

    @Column({nullable: true, name: 'mtn_money'})
    mtnMoney: string

    @Column({nullable: true, name: 'moov_money'})
    moovMoney: string

    @Column({nullable: false, default: false})
    premium: boolean

    @Column({nullable: false, default: 200000})
    plafonds: number

    @Column({nullable: false, default: 300000, name: 'cumul_mensuel'})
    cumulMensuel: number

    @Column({nullable: true, default: 300000, name: 'cumul_mensuel_restant'})
    cumulMensuelRestant: number

    @Column({nullable: true})
    referralCode: number

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

}