import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    chatId: {type: Number, required: true},
    createdAt: { type: Date, default: Date.now }
});

export const UserTengri = mongoose.model('UserTengri', userSchema);