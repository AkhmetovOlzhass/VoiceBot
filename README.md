# 🎙️ VoiceBot – Телеграм-бот для транскрибации аудио  

VoiceBot – это **Telegram-бот**, который принимает **аудиофайл** или **ссылку на облако Mail.ru**, транскрибирует его с помощью **OpenAI Whisper** и возвращает готовый **DOCX-файл**.  

## 🚀 Стек технологий  
- **Backend:** Node.js (Express, TypeScript, Pupeteer)  
- **AI:** OpenAI Whisper для распознавания речи  
- **Файлы:** Mail.ru Cloud  
- **Вывод:** DOCX (через `docx` npm-пакет)  

## 🎯 Функционал  
✅ Принимает **аудиофайл** или **ссылку на Mail.ru Cloud**  
✅ Загружает и обрабатывает файл  
✅ Использует **Whisper API** для транскрибации  
✅ Генерирует **DOCX-файл** с текстом и отправляет его пользователю  

## 🛠 Установка и запуск  
1️⃣ **Клонируй репозиторий**  
```bash
git clone https://github.com/AkhmetovOlzhass/VoiceBot.git  
cd VoiceBot
```

2️⃣ **Установи зависимости**
```bash
npm install
```

3️⃣ **Создай .env файл и настрой переменные окружения**
```env
TELEGRAM_BOT_TOKEN=
MONGO_URI=
PORT=
OPENAI=
```

4️⃣ **Запусти сервер**
```bash
npm run dev  
```

## 🔗 Ссылки
📜 **Документация OpenAI Whisper**: openai.com/whisper  
📜 **Документация Telegram Bot API**: core.telegram.org/bots/api  
📩 **Связь**: @Shakarymm  

🚀 **Разработка в процессе** – добавляются новые фичи!
