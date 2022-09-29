import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Request {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  slackUserId: string;

  @Column({ nullable: false })
  userName: string;

  @Column({ nullable: false, default: false })
  slackReminderSent: boolean;
}
