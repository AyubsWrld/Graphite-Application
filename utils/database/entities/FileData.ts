import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity()
export class FileData {

    @PrimaryColumn({ type: "text" })
    uri: string;

    @Column({ type: "text" })
    abs_path: string;

    @Column({ type: "text" })
    filename: string;

    @Column({ type: "integer" })
    height: number;

    @Column({ type: "integer" })
    width: number;

    @Column({ type: "text" })
    extension: string;

    @Column({ type: "text" })
    filetype : string;

}
