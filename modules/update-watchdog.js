const fetch = require('node-fetch');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

// Configuration
const versionFilePath = path.join(
  os.homedir(),
  'AppData',
  'Roaming',
  'InstaShield',
  'watchdog-version.txt'
);

const startupExePath = path.join(
  os.homedir(),
  'AppData',
  'Roaming',
  'Microsoft',
  'Windows',
  'Start Menu',
  'Programs',
  'Startup',
  'watchdog.exe'
);

const apiURL = 'https://insta-shield-url-redirection.vercel.app/app-version';

async function getRemoteVersionInfo() {
  try {
    const response = await fetch(apiURL);
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

    const json = await response.json();
    console.log('Parsed JSON:', json);

    return {
      version: json.watchdogVersion,
      downloadUrl: json.watchdogUrl
    };
  } catch (error) {
    console.error('Error fetching remote version:', error.message);
    return null;
  }
}

function getLocalVersion() {
  try {
    return fs.readFileSync(versionFilePath, 'utf-8').trim();
  } catch {
    console.warn('Local version file not found or unreadable.');
    return null;
  }
}

function isNewerVersion(remote, local) {
  const r = remote.split('.').map(Number);
  const l = local.split('.').map(Number);
  for (let i = 0; i < Math.max(r.length, l.length); i++) {
    if ((r[i] || 0) > (l[i] || 0)) return true;
    if ((r[i] || 0) < (l[i] || 0)) return false;
  }
  return false;
}

async function downloadFile(url, destination) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Download error: ${response.statusText}`);
    const buffer = await response.buffer();
    await fs.writeFile(destination, buffer);
  } catch (err) {
    throw new Error('Download failed: ' + err.message);
  }
}

function killRunningWatchdog() {
  try {
    const result = execSync(`tasklist`).toString();
    if (result.toLowerCase().includes('watchdog.exe')) {
      execSync(`taskkill /F /IM watchdog.exe`);
      console.log('Killed running watchdog.exe');
    }
  } catch (err) {
    console.warn('Could not kill watchdog.exe (maybe not running)');
  }
}

function launchWatchdog() {
  try {
    execSync(`start "" "${startupExePath}"`);
    console.log('Restarted watchdog.exe');
  } catch (err) {
    console.warn('Failed to restart watchdog.exe:', err.message);
  }
}

async function updateWatchdog() {
  const remoteInfo = await getRemoteVersionInfo();
  if (!remoteInfo?.version || !remoteInfo?.downloadUrl) {
    console.error('Invalid version data from server.');
    return;
  }

  const localVersion = getLocalVersion();
  if (!localVersion || isNewerVersion(remoteInfo.version, localVersion)) {
    console.log(`Updating watchdog.exe to version ${remoteInfo.version}...`);

    const tempExePath = path.join(os.tmpdir(), 'watchdog.exe');

    try {
      await downloadFile(remoteInfo.downloadUrl, tempExePath);

      // Kill current watchdog process
      killRunningWatchdog();

      // Replace the old watchdog.exe
      await fs.copy(tempExePath, startupExePath, { overwrite: true });

      // Save new version info
      await fs.writeFile(versionFilePath, remoteInfo.version, 'utf-8');

      // Launch the updated EXE
      launchWatchdog();

      console.log('Watchdog updated and restarted successfully.');
    } catch (err) {
      console.error('Update failed:', err.message);
    }
  } else {
    console.log('Watchdog is up to date.');
  }
}

updateWatchdog();

module.exports = updateWatchdog;
