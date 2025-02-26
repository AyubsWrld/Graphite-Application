import { Entity, PrimaryGeneratedColumn, Column , PrimaryColumn } from "typeorm";

@Entity()
export class Image{
    @PrimaryColumn( { type : "varchar"} )
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

}
