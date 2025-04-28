export interface Window {
    title: string;
    app: string;
    pid: number;
    windowId: number;

    close(): Promise<void>;
}

export interface WindowHandler {
    getWindows(): Promise<Window[]>;
}