import { UUID } from "crypto";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({
    name: 'employees'
})

export class Employee {
    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column({nullable: false})
    fullname: string

    @Column({nullable: false, unique: true})
    phoneNumber: string

    @Column({nullable: true, unique: true})
    email: string

    @Column({nullable: true})
    address: string

    @Column({nullable: true})
    userid: number

    @Column({default: false})
    isActive: boolean

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}