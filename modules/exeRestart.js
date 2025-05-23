const { exec, execFile } = require('child_process');
const fs = require('fs');
const path = require('path');

const killProcessByName = (processName) => {
  return new Promise((resolve, reject) => {
    const cmd = `taskkill /IM ${processName} /F`;
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        if (stderr.includes('not found') || stderr.includes('not running')) {
          console.log(`[INFO] Process ${processName} not running.`);
          return resolve();
        }
        return reject(`Failed to kill process: ${stderr}`);
      }
      console.log(`[INFO] Killed ${processName}`);
      resolve();
    });
  });
};

const startExecutable = (exePath) => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(exePath)) {
      return reject(`[ERROR] Executable not found: ${exePath}`);
    }

    execFile(exePath, (error) => {
      if (error) {
        return reject(`[ERROR] Failed to start ${exePath}: ${error.message}`);
      }
      console.log(`[INFO] Started ${exePath}`);
      resolve();
    });
  });
};

const restartMainExe = () => {
  const exeDir = path.resolve(__dirname); // current script directory
  const mainExePath = path.join(exeDir, 'main.exe');

  return new Promise(async (resolve, reject) => {
    try {
      console.log('[INFO] Killing main.exe...');
      await killProcessByName('main.exe');

      console.log(`[INFO] Starting main.exe from: ${mainExePath}`);
      await startExecutable(mainExePath);

      resolve('[SUCCESS] main.exe restarted.');
    } catch (error) {
      reject('[ERROR] ' + error);
    }
  });
};

module.exports = {
  restartMainExe,
};
