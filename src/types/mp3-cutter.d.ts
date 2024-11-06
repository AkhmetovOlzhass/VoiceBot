declare module 'mp3-cutter' {
    interface CutOptions {
        src: string;     // Путь к исходному MP3-файлу
        target: string;  // Путь для сохранения выходного MP3-файла
        start: number;   // Время начала в секундах
        end: number;     // Время окончания в секундах
    }

    export function cut(options: CutOptions): void;
}