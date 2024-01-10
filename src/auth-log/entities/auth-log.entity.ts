import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({
    name: "auth_log"
})

export class AuthLog {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    phoneType: string;

    @Column()
    phoneModel: string;

    @Column()
    modelId: string;

    @Column()
    userId: number

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}