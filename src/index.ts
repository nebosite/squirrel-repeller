import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface Window {
  title: string;
  app: string;
}

class MacWindowHandler {
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

    try {
      const { stdout } = await execAsync(`osascript -e '${script}'`);
      const windows: Window[] = [];
      
      // Parse the output which comes as pairs of app name and window title
      const pairs = stdout.trim().split(', ');
      for (let i = 0; i < pairs.length; i += 2) {
        if (pairs[i] && pairs[i + 1]) {
          windows.push({
            app: pairs[i],
            title: pairs[i + 1]
          });
        }
      }
      
      return windows;
    } catch (error) {
      console.error('Failed to get windows:', error);
      return [];
    }
  }

  async closeWindow(title: string): Promise<void> {
    const script = `
      tell application "System Events"
        repeat with proc in (processes where background only is false)
          repeat with w in (windows of proc)
            if name of w contains "${title}" then
              close w
            end if
          end repeat
        end repeat
      end tell
    `;

    try {
      await execAsync(`osascript -e '${script}'`);
    } catch (error) {
      console.error(`Failed to close window with title "${title}":`, error);
    }
  }
}

async function main() {
  const windowHandler = new MacWindowHandler();
  const windows = await windowHandler.getWindows();
  
  console.log('Current windows:');
  windows.forEach(w => console.log(`${w.app}: ${w.title}`));
  
  // Close windows with "news" in the title
  for (const window of windows) {
    if (window.title.toLowerCase().includes('news')) {
      console.log(`Closing window: ${window.title}`);
      await windowHandler.closeWindow(window.title);
    }
  }
}

main().catch(console.error); 