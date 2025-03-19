# 🎙️ VoiceBot – Telegram Bot for Audio Transcription  

VoiceBot is a **Telegram bot** that accepts **an audio file** or **a link to Mail.ru Cloud**, transcribes it using **OpenAI Whisper**, and returns a **DOCX file** with the transcribed text.  

## 🚀 Tech Stack  
- **Backend:** Node.js (Express, TypeScript, Puppeteer)  
- **AI:** OpenAI Whisper for speech recognition  
- **File Handling:** Mail.ru Cloud  
- **Output Format:** DOCX (via `docx` npm package)  

## 🎯 Features  
✅ Accepts **audio files** or **Mail.ru Cloud links**  
✅ Downloads and processes the file  
✅ Uses **Whisper API** for transcription  
✅ Generates a **DOCX file** with the transcribed text and sends it back to the user  

## 🛠 Installation & Setup  
1️⃣ **Clone the repository**  
```bash
git clone https://github.com/AkhmetovOlzhass/VoiceBot.git  
cd VoiceBot
```

2️⃣ **Install dependencies**
```bash
npm install
```

3️⃣ **Create a .env file and set environment variables**
```env
TELEGRAM_BOT_TOKEN=
MONGO_URI=
PORT=
OPENAI=
```

4️⃣ **Run the server**
```bash
npm run dev  
```

## 🔗 Useful Links
📜 **OpenAI Whisper Documentation**: openai.com/whisper  
📜 **Telegram Bot API Documentation**: core.telegram.org/bots/api  
📩 **Contact**: @Shakarymm  

🚀 **Development in progress** – new features coming soon!
