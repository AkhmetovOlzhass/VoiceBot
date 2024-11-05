import mongoose from "mongoose";
import dotenv from 'dotenv';
import { UserTengri } from "./models/UserTengri";

dotenv.config();

export function mongoConnect(bot) {
    mongoose.connect(process.env.MONGO_URI as string)
        .then(async () => {
            console.log('Connected to MongoDB');
        })
        .catch((err) => console.error('Error connecting to MongoDB:', err));
}