# Базовый образ с Node.js
FROM node:16

# Установка зависимостей для Chrome и Puppeteer
RUN apt-get update && apt-get install -y wget gnupg \
    && wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list' \
    && apt-get update && apt-get install -y google-chrome-stable ffmpeg \
    --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Установка рабочей директории
WORKDIR /app

# Копирование файлов package.json и package-lock.json
COPY package*.json ./

# Установка зависимостей
RUN npm install

# Копирование всего кода приложения
COPY . .

# Компиляция TypeScript, если используется
RUN npm run build

# Экспонирование порта для Heroku
EXPOSE 3000

# Установка переменной окружения для Puppeteer
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Команда для запуска приложения
CMD ["npm", "start"]
