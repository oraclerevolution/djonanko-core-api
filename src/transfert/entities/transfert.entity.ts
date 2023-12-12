import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TransactionType } from "../enums/transfer-type.enum";

@Entity({
    name: 'transfert'
})

export class Transfert {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    amount: string;

    @Column({name: 'amount_before_sending'})
    amountBeforeSending: string;

    @Column({name: 'amount_after_sending'})
    amountAfterSending: string;

    @Column({name: 'sender_phone_number'})
    senderPhoneNumber: string;

    @Column({name: 'receiver_phone_number'})
    receiverPhoneNumber: string;

    @Column({name: 'fees'})
    fees: string;

    @Column({
        type: 'enum',
        enum: TransactionType,
        default: TransactionType.PENDING
    })
    status: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}