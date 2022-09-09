import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Request {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })  
  command_name: string;

  @Column({ nullable: false })  
  arg_body: string;

  @Column({ nullable: false })
  response_url: string;

  @Column({ nullable: false })
  slack_user_id: string;

  @Column({ nullable: false })
  slack_user_name: string;
}