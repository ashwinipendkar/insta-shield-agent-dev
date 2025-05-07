const path = require('path');
const { spawnSync, spawn } = require('child_process');
const fs = require('fs');
const https = require('https');
const http = require('http');

const API_ENDPOINT = 'https://insta-shield-url-redirection.vercel.app/app-version';
const executableDir = path.join(process.env.APPDATA, 'InstaShield');
const executablePath = path.join(executableDir, 'main.exe');

// Simple GET → JSON
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    lib.get(url, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('Invalid JSON')); }
      });
    }).on('error', reject);
  });
}

// Download with automatic redirect following
function downloadFile(fileUrl, destPath) {
  return new Promise((resolve, reject) => {
    const lib = fileUrl.startsWith('https') ? https : http;
    const download = url => {
      const req = lib.get(url, res => {
        if ([301, 302].includes(res.statusCode)) {
          return download(res.headers.location);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`Failed to download. Status: ${res.statusCode}`));
        }
        const file = fs.createWriteStream(destPath);
        res.pipe(file);
        file.on('finish', () => file.close(resolve));
      });
      req.on('error', reject);
    };
    download(fileUrl);
  });
}

// Kill main.exe if it's running
function killExistingMain() {
  console.log('[WATCHDOG] Checking for running main.exe processes…');
  // /F = force, /IM = image name
  const result = spawnSync('taskkill', ['/F', '/IM', 'main.exe'], { stdio: 'ignore' });
  // ignore errors (e.g. not found)
  console.log('[WATCHDOG] Any running main.exe instances have been terminated.');
}

(async () => {
  try {
    console.log('[WATCHDOG] Checking for updates…');
    const { version: latestVersion, downloadUrl } = await fetchJSON(API_ENDPOINT);
    console.log(`[WATCHDOG] Latest version: ${latestVersion}`);
    
    const versionFile = path.join(executableDir, 'version.txt');
    let currentVersion = fs.existsSync(versionFile)
      ? fs.readFileSync(versionFile, 'utf-8').trim()
      : null;
    
    if (latestVersion !== currentVersion) {
      console.log(`[WATCHDOG] New version detected (${currentVersion || 'none'} → ${latestVersion}).`);
      
      // 1) Kill existing main.exe
      killExistingMain();
      
      // 2) Download new exe
      console.log('[WATCHDOG] Downloading new main.exe…');
      const tempPath = path.join(executableDir, 'main_new.exe');
      await downloadFile(downloadUrl, tempPath);

      // 3) Replace old exe
      if (fs.existsSync(executablePath)) fs.unlinkSync(executablePath);
      fs.renameSync(tempPath, executablePath);
      fs.writeFileSync(versionFile, latestVersion);

      console.log('[WATCHDOG] Update applied successfully.');
    } else {
      console.log('[WATCHDOG] Already up to date.');
    }
  } catch (err) {
    console.error('[WATCHDOG] Update check failed:', err.message);
  }

  // Verify exe exists then launch
  if (!fs.existsSync(executablePath)) {
    console.error('[WATCHDOG] main.exe not found – aborting.');
    process.exit(1);
  }

  try {
    const child = spawn(executablePath, [], {
      detached: true,
      stdio: 'ignore',
    });
    child.unref();
    console.log(`[WATCHDOG] Launched main.exe (PID: ${child.pid}).`);
  } catch (err) {
    console.error('[WATCHDOG] Failed to launch main.exe:', err);
  }
})();
