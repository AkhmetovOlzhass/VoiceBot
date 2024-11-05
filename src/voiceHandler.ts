import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import { convertAudio } from './openai';
import TelegramBot from 'node-telegram-bot-api';
import { createDocx } from './docs';

dotenv.config();

const downloadVoiceFile = async (bot: TelegramBot, fileId: string): Promise<string> => {
    const fileInfo = await bot.getFile(fileId);
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) throw new Error("Telegram bot token is not defined in environment variables.");
    const fileUrl = `https://api.telegram.org/file/bot${token}/${fileInfo.file_path}`;
    return fileUrl;
};

export const handleVoiceMessage = async (bot: TelegramBot, msg: TelegramBot.Message): Promise<void> => {
    const chatId = msg.chat.id;
    const fileId = msg.audio?.file_id; // Assuming it's handling audio messages

    if (!fileId) {
        await bot.sendMessage(chatId, 'Не удалось получить файл аудио.');
        return;
    }

    try {
        // Получение URL для скачивания файла
        const fileUrl = await downloadVoiceFile(bot, fileId);
        const fileName = `src/voicemessages/voice_${Date.now()}.mp3`;

        // Скачивание и сохранение файла
        const response = await axios({
            method: 'get',
            url: fileUrl,
            responseType: 'stream'
        });

        const writeStream = fs.createWriteStream(fileName);
        response.data.pipe(writeStream);

        writeStream.on('finish', async () => {
            try {
                const audioText = await convertAudio(fileName);

                const docxPath = `src/docxs/docx_${Date.now()}.docx`

                await createDocx(docxPath, audioText);

                await bot.sendDocument(chatId, docxPath);

                fs.unlink(fileName, (err) => {
                    if (err) {
                        console.error('Ошибка при удалении файла:', err);
                    } else {
                        console.log('Файл успешно удален:', fileName);
                    }
                });
                fs.unlink(docxPath, (err) => {
                    if (err) {
                        console.error('Ошибка при удалении файла:', err);
                    } else {
                        console.log('Файл успешно удален:', docxPath);
                    }
                });
            } catch (err) {
                // Обработка ошибок конвертации
                await bot.sendMessage(chatId, 'Ошибка при обработке аудио сообщения.');
                console.error(err);
            }
        });
    } catch (error) {
        await bot.sendMessage(chatId, 'Ошибка при обработке аудио сообщения.');
        console.error(error);
    }
};
