import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({
    name: 'communes'
})

export class Communes {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({
        unique: true
    })
    name: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}