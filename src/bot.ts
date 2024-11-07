import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import MP3Cutter from 'mp3-cutter';

import { UserTengri } from './models/UserTengri';
import { mongoConnect } from './connectDB';
import { convertAudio } from './openai';
import { createDocx } from './docs';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN as string;
const bot = new TelegramBot(token, { polling: true });

mongoConnect(bot);

export const start = () => {
    bot.onText(/\/start/, async (msg: TelegramBot.Message) => {
        const chatId = msg.chat.id;
        const username = msg.from?.username;

        if (!username) {
            bot.sendMessage(chatId, `Не удалось определить имя пользователя.`);
            return;
        }

        let user = await UserTengri.findOne({ username });
        if (!user) {
            user = new UserTengri({ username, chatId });
            await user.save();
        } else if (!user.chatId) {
            user.chatId = chatId;
            await user.save();
        }

        bot.sendMessage(chatId, `Отправьте аудио файл или ссылку на облако Mail.ru, и я верну его текст в формате Docx`);
    });

    bot.on('text', async (msg: TelegramBot.Message) => {
        const chatId = msg.chat.id;
        const text = msg.text;

        if (text?.includes('cloud.mail.ru')) {
            bot.sendMessage(chatId, 'Начинаю скачивание файла...');

            try {
                const browser = await puppeteer.launch({
                    headless: true,
                    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/google-chrome',
                    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
                });
                const page = await browser.newPage();

                const downloadPath = path.resolve(__dirname, 'downloads');
                fs.mkdirSync(downloadPath, { recursive: true });

                const client = await page.target().createCDPSession();
                await client.send('Page.setDownloadBehavior', {
                    behavior: 'allow',
                    downloadPath: downloadPath,
                });

                await page.goto(text);
                await page.setViewport({ width: 1080, height: 1024 });

                // Кликаем по кнопке "Скачать файл"
                await page.waitForSelector('[data-qa-id="download"]');
                await page.click('[data-qa-id="download"]');

                await bot.sendMessage(chatId, 'Загрузка началась, ожидаем завершения...');

                // Ждем, пока файл полностью загрузится
                const downloadedFilePath = await waitForDownloadComplete(downloadPath);

                await bot.sendMessage(chatId, 'Закончилась');

                await browser.close();

                if (fs.existsSync(downloadedFilePath)) {
                    bot.sendMessage(chatId, 'Файл успешно загружен. Обрабатываю текст...');

                    const docxs = await processLargeAudio(downloadedFilePath) as string;

                    await bot.sendDocument(chatId, docxs);

                    // Удаляем временные файлы
                    fs.unlinkSync(downloadedFilePath);
                    fs.unlinkSync(docxs);
                } else {
                    bot.sendMessage(chatId, 'Ошибка: файл не был загружен.');
                }

            } catch (error) {
                bot.sendMessage(chatId, 'Ошибка при скачивании файла');
                console.error(error);
            }
        }
    });
};

async function waitForDownloadComplete(downloadPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const checkFileInterval = 1000; // Интервал проверки (1 секунда)
        const maxWaitTime = 600000; // Максимальное время ожидания (10 минут)
        const stabilityChecks = 10; // Количество проверок стабильности размера файла
        let stableCount = 0; // Счетчик для проверок стабильности
        const startTime = Date.now();
        let previousSize = 0;

        const interval = setInterval(() => {
            const files = fs.readdirSync(downloadPath);

            if (files.length === 0) {
                // Если файл еще не появился, продолжаем ожидать
                if (Date.now() - startTime > maxWaitTime) {
                    clearInterval(interval);
                    reject(new Error("Файл не был загружен за отведенное время"));
                }
                return;
            }

            const filePath = path.join(downloadPath, files[0]);
            const stats = fs.statSync(filePath);
            const currentSize = stats.size;

            // Проверяем, что размер файла не меняется в течение нескольких проверок
            if (currentSize === previousSize && currentSize > 0) {
                stableCount += 1;
                if (stableCount >= stabilityChecks) {
                    clearInterval(interval);
                    resolve(filePath);
                }
            } else {
                stableCount = 0; // Сбрасываем счетчик, если размер изменился
                previousSize = currentSize; // Обновляем previousSize
            }

            // Проверяем, не истекло ли максимальное время ожидания
            if (Date.now() - startTime > maxWaitTime) {
                clearInterval(interval);
                reject(new Error("Файл не был загружен за отведенное время"));
            }
        }, checkFileInterval);
    });
}

async function splitMp3File(filePath: string, chunkDuration: number = 1000): Promise<string[]> {
    const outputPaths: string[] = [];
    const outputDir = path.dirname(filePath);
    const fileName = path.basename(filePath, path.extname(filePath));

    // Предполагаем, что у вас есть способ получить продолжительность аудио файла.
    // Для этого примера можно использовать библиотеку mp3-duration или любое другое средство.
    const getAudioDuration = async (filePath: string): Promise<number> => {
        const mp3Duration = require('mp3-duration');
        return new Promise<number>((resolve, reject) => {
            mp3Duration(filePath, (err: any, duration: number) => {
                if (err) reject(err);
                resolve(duration);
            });
        });
    };

    const duration = await getAudioDuration(filePath); // Получаем общую продолжительность файла
    let start = 0;
    let index = 0;

    while (start < duration) {
        const end = Math.min(start + chunkDuration, duration);
        const outputPath = path.join(outputDir, `${fileName}_part${index}.mp3`);
        
        // Обрезаем часть аудиофайла с помощью MP3Cutter
        MP3Cutter.cut({
            src: filePath,
            target: outputPath,
            start,
            end,
        });

        outputPaths.push(outputPath);
        start = end;
        index++;
    }

    return outputPaths;
}

async function processLargeAudio(filePath: string) {
    try {
        const chunks = await splitMp3File(filePath, 1000); // Разделение на фрагменты по 1000 секунд
        let combinedText = ''; // Переменная для объединенного текста

        for (const chunkPath of chunks) {
            const audioText = await convertAudio(chunkPath); // Преобразование аудиофрагмента в текст
            combinedText += audioText + '\n'; // Добавление текста фрагмента с переводом строки
            fs.unlinkSync(chunkPath); // Удаление временного файла после обработки
        } 

        // Создаем .docx файл с объединенным текстом
        const docxPath = `output_${Date.now()}.docx`;
        await createDocx(docxPath, combinedText);
        console.log(`Объединенный текст успешно сохранен в ${docxPath}`);
        
        return docxPath;


    } catch (error) {
        console.error("Ошибка при обработке аудиофайла:", error);
    }
}
