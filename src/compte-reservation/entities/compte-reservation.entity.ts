import { TransactionType } from "src/historiques/enums/transaction-type.enum";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({
    name: 'compte_reservation'
})

export class CompteReservation {
    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column()
    amount: string

    @Column()
    fees: string

    @Column({
        name: 'transaction_status', 
        type:"enum", 
        enum: ["IN PROGRESS", "COMPLETED", "FAILED"]}
    )
    transactionStatus: string

    @Column({name: 'transaction_type', type:"enum", enum: TransactionType})
    transactionType: string

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}