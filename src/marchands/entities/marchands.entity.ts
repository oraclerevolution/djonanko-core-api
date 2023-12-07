import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

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

    @Column({default:"0"})
    PaymentNumber: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}