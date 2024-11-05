import mongoose from "mongoose";
import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';

dotenv.config();

export function mongoConnect(bot: TelegramBot) {
    mongoose.connect(process.env.MONGO_URI as string)
        .then(async () => {
            console.log('Connected to MongoDB');
        })
        .catch((err) => console.error('Error connecting to MongoDB:', err));
}
