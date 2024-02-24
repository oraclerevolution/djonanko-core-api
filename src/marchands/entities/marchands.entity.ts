import { CategorieMarchands } from "src/categorie-marchands/entities/categorie-marchands.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "src/user/entities/user.entity";
import { MerchantType } from "../enums/merchant-type.enum";

@Entity({
    name: 'marchands'
})

export class Marchands {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({unique: true})
    name: string;

    @Column()
    logo: string;

    @Column()
    phoneNumber: string;

    @Column({nullable: true, default: false})
    IsMatriculeExist: boolean;

    @Column({nullable: true})
    textIfMatriculeExist: string;

    @Column({nullable: true, enum: MerchantType})
    merchantType: string;

    @Column({default:"0"})
    PaymentNumber: string;

    @Column({nullable: false})
    userId: number;

    @Column({nullable: false})
    categorieId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}