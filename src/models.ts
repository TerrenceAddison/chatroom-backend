import { Model, Column, Table, DataType, ForeignKey } from 'sequelize-typescript';

@Table({ tableName: 'users' })
class User extends Model {
  @Column({ primaryKey: true})
  id!: string;

  @Column(DataType.STRING)
  displayName!: string;

  @Column(DataType.DATE)
  createdAt!: Date;

  @Column(DataType.DATE)
  lastLoginAt!: Date;
}

@Table({ tableName: 'chat_rooms' })
class ChatRoom extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  id!: number;

  @ForeignKey(() => User)
  @Column(DataType.STRING)
  member1Id!: string;

  @ForeignKey(() => User)
  @Column(DataType.STRING)
  member2Id!: string;

  @Column(DataType.DATE)
  createdAt!: Date;
}


@Table({ tableName: 'messages' })
class Message extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  id!: number;

  @Column(DataType.TEXT)
  content!: string;

  @ForeignKey(() => User)
  @Column(DataType.STRING)
  senderId!: string;

  @ForeignKey(() => ChatRoom)
  @Column(DataType.STRING)
  chatRoomId!: string;

  @Column(DataType.DATE)
  createdAt!: Date;
}

export { User, ChatRoom, Message };
