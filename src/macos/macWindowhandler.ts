import { WindowHandler, Window } from "../interfaces/windowHandler";
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

export class MacWindow implements Window {
    app: string = "na";
    title: string = "na";
    pid: number = 0;
    windowId: number = 0;

    constructor(app: string, title: string, pid: number, windowId: number) {
        this.app = app;
        this.title = title;
        this.pid = pid;
        this.windowId = windowId;
    }

    // ------------------------------------------------------------
    // Get all windows
    // ------------------------------------------------------------
    async close(): Promise<void> {
        const script = `
          tell application "System Events"
            repeat with proc in (processes where background only is false)
              repeat with w in (windows of proc)
                if name of w contains "${this.title}" then
                  close w
                end if
              end repeat
            end repeat
          end tell
        `;
    
        try {
            await execAsync(`osascript -e '${script}'`);
        } catch (error) {
            console.error(`Failed to close window with title "${this.title}":`, error);
        }
    }
} 

export class MacWindowHandler implements WindowHandler {

    // ------------------------------------------------------------
    // Get all windows
    // ------------------------------------------------------------
    async getWindows(): Promise<Window[]> {
        const script = `
          tell application "System Events"
            set windowList to {}
            repeat with proc in (processes where background only is false)
              set procName to name of proc
              repeat with w in (windows of proc)
                set end of windowList to {procName, name of w}
              end repeat
            end repeat
            return windowList
          end tell
        `;

          
        const { stdout } = await execAsync(`osascript -e '${script}'`);
        console.log(stdout);
        console.log("--------------------------------");    
        
        const windows: Window[] = [];
        
        // Parse the output which comes as pairs of app name and window title
        const pairs = stdout.trim().split(', ');
        for (let i = 0; i < pairs.length; i += 2) {
            if (pairs[i] && pairs[i + 1]) {
                windows.push(new MacWindow(pairs[i], pairs[i + 1], 0, 0));
            }
        }
        
        return windows;

    }
    

}