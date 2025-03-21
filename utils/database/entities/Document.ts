import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  filename: string;

  @Column()
  extension: string;

  @Column()
  uri: string;

  @Column()
  abs_path: string;

  @Column()
  size: number;

  @Column({ nullable: true })
  created_at: Date;

  @Column({ nullable: true })
  updated_at: Date;

  constructor() {
    this.created_at = new Date();
    this.updated_at = new Date();
  }
}
