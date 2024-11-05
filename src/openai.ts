import OpenAI from "openai";
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI
});

export async function convertAudio(path: fs.PathLike) {
    
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(path),
      model: "whisper-1",
    });

    
    return transcription.text

}