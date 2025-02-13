import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class video{
    @PrimaryGeneratedColumn( { type : "varchar"} )
    abs_path  : string ;

    @Column({ type: "varchar" })
    filename  : string;

    @Column({ type: "smallint" })
    height    : number;

    @Column({ type: "smallint" })
    width     : number;

    @Column({ type: "varchar" })
    extension : string;

    @Column({ type: "varchar" })
    uri      : string;

    @Column({ type: "smallint" })
    duration : string;
}
