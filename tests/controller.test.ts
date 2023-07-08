import { Request, Response } from 'express';
import { sendMessage, getChatRoomsByUser, getMessagesInChatRoom } from '../src/controller';
import { User, ChatRoom, Message } from '../src/models';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';


const sequelize = new Sequelize('database', 'username', 'password', {
    dialect: 'postgres',
    host: 'localhost',
});
  
sequelize.addModels([User, ChatRoom, Message]);

  
describe('sendMessage', () => {
  it('should return an error for missing parameters', async () => {
    const req = {
      body: {},
    } as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    await sendMessage(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing required parameters' });
  });
  it('should return an error for sending a message to oneself', async () => {
    const req = {
      body: {
        senderId: 'userId',
        receiverId: 'userId',
        content: 'test',
      },
    } as Request;
  
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    await sendMessage(req, res);
  
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Cannot send a message to oneself' });
  });

  it('should return an error if sender or receiver not found', async () => {
    jest.spyOn(User, 'findAll').mockResolvedValue([]);

    const req = {
      body: {
        senderId: 'nonexistentId',
        receiverId: 'receiverId',
        content: 'test',
      },
    } as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    await sendMessage(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Sender or receiver not found' });
  });

  it('should handle error while sending message', async () => {
    const error = new Error('Database error');
    jest.spyOn(User, 'findAll').mockRejectedValue(error);

    const req = {
      body: {
        senderId: 'senderId',
        receiverId: 'receiverId',
        content: 'test',
      },
    } as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    await sendMessage(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'An error occurred while sending the message' });
  });

  it('should send a message successfully when chatroom exists', async () => {
    // mocks (had some help with AI for mock designing)
    const sender = User.build({
        id: 'senderId',
    });
    const receiver = User.build({
        id: 'receiverId',
    });
    jest.spyOn(User, 'findAll').mockResolvedValue([sender,receiver]);

    const chatRoom = ChatRoom.build({
        id: 1,
    });

    jest.spyOn(ChatRoom, 'findOne').mockResolvedValue(chatRoom);

    const messageCreateMock = jest.spyOn(Message, 'create').mockResolvedValue({});
    const req = {
      body: {
        senderId: 'senderId',
        receiverId: 'receiverId',
        content: 'test',
      },
    } as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    await sendMessage(req, res);

    expect(messageCreateMock).toHaveBeenCalledWith({
      content: 'test',
      senderId: 'senderId',
      chatRoomId: 1,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Message sent successfully' });
  });
  it('should send a message successfully and create a chatroom when chatroom doesnt exist', async () => {
    const sender = User.build({
      id: 'senderId',
    });
    const receiver = User.build({
      id: 'receiverId',
    });
    jest.spyOn(User, 'findAll').mockResolvedValue([sender, receiver]);
  
    jest.spyOn(ChatRoom, 'findOne').mockResolvedValue(null);
    const createChatRoomMock = jest.spyOn(ChatRoom, 'create').mockResolvedValue({ id: 1 });
    const messageCreateMock = jest.spyOn(Message, 'create').mockResolvedValue({});

    const req = {
      body: {
        senderId: 'senderId',
        receiverId: 'receiverId',
        content: 'test',
      },
    } as Request;
  
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;
  
    await sendMessage(req, res);

    expect(createChatRoomMock).toHaveBeenCalledWith({
      member1Id: 'senderId',
      member2Id: 'receiverId',
    });
    expect(messageCreateMock).toHaveBeenCalledWith({
      content: 'test',
      senderId: 'senderId',
      chatRoomId: 1,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Message sent successfully' });
  });
});

describe('getChatRoomsByUser', () => {
  const userId = 'userId';
  const user = User.build({
    id: userId,
  });
  const chatRoom = ChatRoom.build({
    id: 1,
  });

  it('should return error for user not found', async () => {
    jest.spyOn(User, 'findByPk').mockResolvedValue(null);

    const req = {
      params: {
        userId: 'nonExistendId',
      },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    await getChatRoomsByUser(req, res);

    expect(User.findByPk).toHaveBeenCalledWith('nonExistendId');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
  });

  it('should handle error while getting chat rooms', async () => {
    jest.spyOn(User, 'findByPk').mockResolvedValue(user);

    const error = new Error('Database error');
    jest.spyOn(ChatRoom, 'findAll').mockRejectedValue(error);

    const req = {
      params: {
        userId: 'userId',
      },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    await getChatRoomsByUser(req, res);

    expect(User.findByPk).toHaveBeenCalledWith('userId');
    expect(ChatRoom.findAll).toHaveBeenCalledWith({
      where: {
        [Op.or]: [
          { member1Id: 'userId' },
          { member2Id: 'userId' },
        ],
      },
    });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'An error occurred while getting chatrooms' });
  });

  it('should return chat rooms for a user', async () => {
    jest.spyOn(User, 'findByPk').mockResolvedValue(user);
    jest.spyOn(ChatRoom, 'findAll').mockResolvedValue([chatRoom]);

    const req = {
      params: {
        userId: 'userId',
      },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    await getChatRoomsByUser(req, res);

    expect(User.findByPk).toHaveBeenCalledWith(userId);
    expect(ChatRoom.findAll).toHaveBeenCalledWith({
      where: {
        [Op.or]: [
          { member1Id: userId },
          { member2Id: userId },
        ],
      },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ chatRooms: [chatRoom] });
  });
});

describe('getMessagesInChatRoom', () => {
  const chatRoomId = 1;
  const chatRoom = ChatRoom.build({
    id: chatRoomId,
  });

  const message1 = Message.build({id: 1, content: 'Message 1'});
  const message2 = Message.build({id: 2, content: 'Message 2'});
  const messages = [message1, message2];

  it('should return error for invalid chat room ID', async () => {
    const req = {
      params: {
        chatRoomId: 'invalidId',
      },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    await getMessagesInChatRoom(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid chat room ID' });
  });

  it('should return error for chat room not found', async () => {
    jest.spyOn(ChatRoom, 'findByPk').mockResolvedValue(null);

    const req = {
      params: {
        chatRoomId: chatRoomId.toString(),
      },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    await getMessagesInChatRoom(req, res);

    expect(ChatRoom.findByPk).toHaveBeenCalledWith(chatRoomId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Chat room not found' });
  });

  it('should return messages in the chat room', async () => {
    jest.spyOn(ChatRoom, 'findByPk').mockResolvedValue(chatRoom);
    jest.spyOn(Message, 'findAll').mockResolvedValue(messages);

    const req = {
      params: {
        chatRoomId: chatRoomId.toString(),
      },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    await getMessagesInChatRoom(req, res);

    expect(ChatRoom.findByPk).toHaveBeenCalledWith(chatRoomId);
    expect(Message.findAll).toHaveBeenCalledWith({
      where: {
        chatRoomId,
      },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ messages });
  });

  it('should handle error while getting messages', async () => {
    jest.spyOn(ChatRoom, 'findByPk').mockResolvedValue(chatRoom);

    const error = new Error('Database error');
    jest.spyOn(Message, 'findAll').mockRejectedValue(error);

    const req = {
      params: {
        chatRoomId: chatRoomId.toString(),
      },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    await getMessagesInChatRoom(req, res);

    expect(ChatRoom.findByPk).toHaveBeenCalledWith(chatRoomId);
    expect(Message.findAll).toHaveBeenCalledWith({
      where: {
        chatRoomId,
      },
    });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'An error occurred while getting messages' });
  });
});

