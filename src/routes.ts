import express from 'express';
import { sendMessage } from './controller';

const routes = express.Router();
routes.post('/send-message', sendMessage);

export default routes;
