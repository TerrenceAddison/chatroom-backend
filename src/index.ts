import express from 'express';
import dotenv from 'dotenv';
import sequelize from './db';
import fs from 'fs';
import { Client } from 'pg';
import { User } from './models';
import routes from './routes';

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/', routes);
const port =  8000;
const { POSTGRES_HOST, POSTGRES_PORT, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB } = process.env;


const initializeDatabase = async (): Promise<void> => {
    try {
    //   await sequelize.sync();
      await sequelize.sync({ force: true }); // for db reset
      console.log('Database synchronization completed.');
    } catch (error) {
      console.error('Error synchronizing database:', error);
    }
};

const importUsersFromCSV = async (filePath: string): Promise<void> => {
    try {
      const csvData = fs.readFileSync(filePath, 'utf-8');
      const rows = csvData.split('\n').slice(1); // Remove header row
  
      const client = new Client({
        database: POSTGRES_DB,
        host: POSTGRES_HOST,
        port: parseInt(POSTGRES_PORT || '5432', 10),
        user: POSTGRES_USER,
        password: POSTGRES_PASSWORD,
      });
      await client.connect();
  
      for (const row of rows) {
        const [id, displayName, createdAt, lastLoginAt] = row.split(',');
  
        const user = new User();
        user.id = id;
        user.displayName = displayName;
        user.createdAt = new Date(createdAt);
        user.lastLoginAt = new Date(lastLoginAt);
  
        await user.save();
      }
  
      await client.end();
  
      console.log('Users imported successfully.');
    } catch (error) {
      console.error('Error importing users:', error);
    }
};
  
initializeDatabase().then(async () => {
    const csvFilePath = 'User-Info.csv';
  
    const isEmpty = await User.count() === 0;
  
    if (isEmpty) {
      await importUsersFromCSV(csvFilePath);
    } else {
      console.log('Skipping user import. Users table is not empty.');
    }
  
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
});
