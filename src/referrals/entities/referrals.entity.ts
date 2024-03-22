import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({
    name: 'referrals'
})

export class Referrals {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    hostId: number;

    @Column()
    guessId: number;
}