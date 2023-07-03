import { Model, Column, Table, DataType, ForeignKey, BelongsToMany, HasMany } from 'sequelize-typescript';

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

  @BelongsToMany(() => ChatRoom, 'chat_room_members', 'userId', 'chatRoomId')
  chatRooms!: ChatRoom[];
}

@Table({ tableName: 'chat_rooms' })
class ChatRoom extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  id!: number;

  @BelongsToMany(() => User, 'chat_room_members', 'chatRoomId', 'userId')
  members!: User[];

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
  @Column(DataType.INTEGER)
  senderId!: number;

  @ForeignKey(() => ChatRoom)
  @Column(DataType.INTEGER)
  chatRoomId!: number;

  @Column(DataType.DATE)
  createdAt!: Date;
}

export { User, ChatRoom, Message };
