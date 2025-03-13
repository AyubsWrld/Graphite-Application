import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    username: string;

    @Column({ type: "varchar" })
    email: string;

    @Column({ type: "varchar" })
    firstname : string;

    @Column({ type: "varchar" })
    lastname : string;
}
