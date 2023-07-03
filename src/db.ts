import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import {User, ChatRoom, Message } from './models'
dotenv.config();

const { POSTGRES_HOST, POSTGRES_PORT, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB } = process.env;

const sequelize = new Sequelize({
  database: POSTGRES_DB,
  dialect: 'postgres',
  host: POSTGRES_HOST,
  port: parseInt(POSTGRES_PORT || '5432', 10),
  username: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
  models: [User, ChatRoom, Message],
});

export default sequelize;
