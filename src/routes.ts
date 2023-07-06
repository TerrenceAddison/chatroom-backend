import express from 'express';
import { sendMessage, getChatRoomsByUser, getMessagesInChatRoom } from './controller';

const routes = express.Router();
routes.post('/send-message', sendMessage);
routes.get('/chatrooms/:userId', getChatRoomsByUser);
routes.get('/chatroom-messages/:chatRoomId', getMessagesInChatRoom);

export default routes;
