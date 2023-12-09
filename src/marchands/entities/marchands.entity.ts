import { CategorieMarchands } from "src/categorie-marchands/entities/categorie-marchands.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

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

    @Column({nullable: false})
    categorieId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}