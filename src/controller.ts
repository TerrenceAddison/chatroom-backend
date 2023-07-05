import { Request, Response } from 'express';
import { ChatRoom, Message, User } from './models';
import { Op } from 'sequelize';

// Route for sending a message to a user
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { senderId, receiverId, content } = req.body;

    if(!senderId || !receiverId || !content) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    const users = await User.findAll({where: {id:[senderId, receiverId]}});
    if(users.length !== 2) {
        return res.status(404).json({ error: 'Sender or receiver not found' });
    }
    
    const chatRoom = await ChatRoom.findOne({
      where: {
        [Op.or]: [
          { member1Id: senderId, member2Id: receiverId },
          { member1Id: receiverId, member2Id: senderId }
        ],
      },
    });

    if (!chatRoom) {
      const newChatRoom = await ChatRoom.create({
        member1Id: senderId,
        member2Id: receiverId,
      });

      await Message.create({
        content,
        senderId,
        chatRoomId: newChatRoom.id,
      });
    } else {
      await Message.create({
        content,
        senderId,
        chatRoomId: chatRoom.id,
      });
    }

    res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'An error occurred while sending the message' });
  }
};
