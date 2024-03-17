import { TransactionType } from "src/transfert/enums/transfer-type.enum";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TransactionType as TypeTransaction } from "src/historiques/enums/transaction-type.enum";
@Entity({
    name: 'transactions'
})
export class Transactions {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    amount: string;

    @Column({name: 'amount_before_sending'})
    amountBeforeSending: string;

    @Column({name: 'amount_after_sending'})
    amountAfterSending: string;

    @Column({name: 'sender_phone_number'})
    senderPhoneNumber: string;

    @Column({name: 'reference'})
    reference: string;

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

    @Column({
        type:"enum",
        enum: TypeTransaction
    })
    type: string

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}