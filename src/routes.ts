import express from 'express';
import { sendMessage, getChatRoomsByUser } from './controller';

const routes = express.Router();
routes.post('/send-message', sendMessage);
routes.get('/chatrooms/:userId', getChatRoomsByUser);

export default routes;
