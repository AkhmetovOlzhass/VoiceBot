declare module 'audioconcat' {
    interface AudioConcat {
        concat(output: string): AudioConcat;
        on(event: 'start' | 'error' | 'end', listener: (message?: string) => void): AudioConcat;
    }

    function audioconcat(files: string[]): AudioConcat;

    export = audioconcat;
}