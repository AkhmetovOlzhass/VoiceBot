import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

import { UserTengri } from './models/UserTengri';
import { mongoConnect } from './connectDB';
import { handleVoiceMessage } from './voiceHandler';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN as string;

const bot = new TelegramBot(token, { polling: true });

mongoConnect(bot);

export const start = () => {
    bot.on('audio', async (msg: TelegramBot.Message) => {
        const chatId = msg.chat.id;
        try{
            const username = msg.from?.username;
    
            if (!username) {
                bot.sendMessage(chatId, `Не удалось определить имя пользователя.`);
                return;
            }
    
            let user = await UserTengri.findOne({ username });
            if (!user) {
                bot.sendMessage(chatId, `Вы не зарегистрированы, введите команду /start`);
                return;
            }
    
            bot.sendMessage(chatId, `Загрузка...`);
    
            await handleVoiceMessage(bot, msg);
        }catch{
            bot.sendMessage(chatId, `Произошла ошибка`);
        }
    });

    // Ответ на команду /start
    bot.onText(/\/start/, async (msg: TelegramBot.Message) => {
        const chatId = msg.chat.id;
        const username = msg.from?.username;

        if (!username) {
            bot.sendMessage(chatId, `Не удалось определить имя пользователя.`);
            return;
        }

        console.log(chatId);

        // Находим пользователя в базе данных
        let user = await UserTengri.findOne({ username });

        if (!user) {
            // Если пользователя нет, создаем нового с chatId
            user = new UserTengri({ username, chatId });
            await user.save();
            console.log(`Новый пользователь зарегистрирован: ${username}`);
        } else {
            // Обновляем chatId, если он не сохранен
            if (!user.chatId) {
                user.chatId = chatId;
                await user.save();
                console.log(`ChatId для пользователя ${username} обновлен`);
            }
        }

        bot.sendMessage(chatId, `Отправьте аудио файл и я верну вам его текст в формате Docx`);
    });
};
