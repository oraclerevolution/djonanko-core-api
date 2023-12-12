import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { CollectType } from "../enums/collect-type.enum";

@Entity({
    name: 'compte_collecte'
})

export class CompteCollect {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({nullable: false})
    amount: string;

    @Column({
        nullable: false, 
        type:'enum',
        enum: CollectType,
    })
    collectType: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}