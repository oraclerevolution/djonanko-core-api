import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({
    name: 'forget-password'
})

export class ForgetPassword {
    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column()
    number: string

    @Column({
        name: 'status',
        default: false
    })
    status: boolean

    @Column({
        name: 'approved_at',
        nullable: true,
        default: null
    })
    approvedAt: Date

    @Column({
        name: 'rated',
        default: 0,
    })
    rated: number
    
    @CreateDateColumn({
        name: 'created_at',
    })
    createdAt: Date

    @UpdateDateColumn({
        name: 'updated_at',
    })
    updatedAt: Date
}