const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Define your custom directory
const appDataPath = process.env.APPDATA || path.join(process.env.HOME, '.config');
const instaShieldDir = path.join(appDataPath, 'InstaShield');
const scriptPath = path.join(instaShieldDir, 'idle_detector.py');

function startUserActivityTracking(onStatusChange) {
  try {
    // Ensure the InstaShield directory exists
    if (!fs.existsSync(instaShieldDir)) {
      fs.mkdirSync(instaShieldDir, { recursive: true });
    }

    // Write the embedded Python script to the target location
    const embeddedScriptPath = path.join(__dirname, 'idle_detector.py');
    const scriptContent = fs.readFileSync(embeddedScriptPath, 'utf-8');
    fs.writeFileSync(scriptPath, scriptContent);

    // Spawn the Python process
    // const py = spawn('python', [scriptPath]);
    const exePath = path.join(instaShieldDir, 'idle_detector.exe');
    const py = spawn(exePath);

    py.stdout.on('data', (data) => {
      const output = data.toString();
      const lines = output.split('\n');
      lines.forEach(line => {
        if (line.trim().startsWith('Status:')) {
          const status = line.trim().split('Status:')[1].trim();
          onStatusChange(status);
        }
      });
    });

    py.stderr.on('data', (data) => {
      console.error(`[Python error] ${data}`);
    });

    py.on('close', (code) => {
      console.log(`[Python script exited with code] ${code}`);
    });

    return py;

  } catch (err) {
    console.error("Failed to start user activity tracking:", err);
  }
}

module.exports = {
  startUserActivityTracking,
};
