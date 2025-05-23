const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROCESS_NAME = 'main.exe';
const WATCHDOG_PATH = path.join(
  process.env.APPDATA,
  'Microsoft',
  'Windows',
  'Start Menu',
  'Programs',
  'Startup',
  'watchdog.exe'
);

function killProcessByName(name) {
    return new Promise((resolve, reject) => {
        const cmd = `taskkill /IM ${name} /F`;
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                if (stderr.includes('not found') || stderr.includes('not running')) {
                    console.log(`[INFO] Process ${name} not running.`);
                    return resolve();
                }
                return reject(`Failed to kill process: ${stderr}`);
            }
            console.log(`[INFO] Killed ${name}`);
            resolve();
        });
    });
}

function startProcess(filePath) {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(filePath)) {
            return reject(`[ERROR] Executable not found: ${filePath}`);
        }

        const child = spawn(filePath, [], {
            detached: true,
            stdio: 'ignore',
        });

        child.unref();
        console.log(`[INFO] Started ${filePath}`);
        resolve();
    });
}

async function restartProcess() {
    try {
        await killProcessByName(PROCESS_NAME);
        await startProcess(WATCHDOG_PATH);
    } catch (error) {
        console.error(`[ERROR] ${error}`);
    }
}

restartProcess();
