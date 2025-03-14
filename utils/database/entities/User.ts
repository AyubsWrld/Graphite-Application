import { Entity, PrimaryColumn , Column } from "typeorm";

@Entity()
export class User {

    @PrimaryColumn( { type: "varchar"} )
    email: string;

    @Column({ type: "varchar" })
    password: string;

    @Column({ type: "varchar" })
    firstname : string;

    @Column({ type: "varchar" })
    lastname : string;
}
