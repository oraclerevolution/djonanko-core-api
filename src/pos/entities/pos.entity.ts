import { Column, CreateDateColumn, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Communes } from "./communes.entity";

@Entity({
    name: 'pos'
})

export class Pos {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    phoneNumber: string;

    @Column()
    address: string;

    @Column()
    openHours: string;

    @Column()
    closeHours: string;

    @ManyToMany(type => Communes, communes => communes.id)
    communeId: Communes;

    @ManyToOne(type => Communes, communes => communes.name)
    communeName: Communes

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}