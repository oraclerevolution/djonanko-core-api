import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({
    name: 'referral'
})

export class Referral {
    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column()
    userId: number

    @ManyToOne(
        () => User,
        (user) => user.id,
    )
    newComer: User

    @Column({default: "0"})
    earned: string

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}