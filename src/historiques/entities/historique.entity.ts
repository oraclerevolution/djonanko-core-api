import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TransactionType } from "../enums/transaction-type.enum";
import { User } from "src/user/entities/user.entity";

@Entity({
    name: 'historiques'
})

export class Historique {
    @PrimaryGeneratedColumn("uuid")
    id: string

    @ManyToOne(
        () => User,
        (user) => user.id,
    )
    sender: User

    @ManyToOne(
        () => User,
        (user) => user.id,
    )
    receiver: User

    @Column({
        type: 'enum',
        enum: TransactionType
    })
    transactionType: string;

    @Column()
    amount: string;

    @Column()
    icon: string;

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}