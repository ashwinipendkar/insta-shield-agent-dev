const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const os = require('os');

const LOG_FILE = path.join('C:', 'Logs', 'phone_logs', 'simple_call_log.json');

// Ensure log folder exists
fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });

function findCallingDbPath() {
  const userDir = os.homedir();
  const basePath = path.join(userDir, 'AppData', 'Local', 'Packages');

  if (!fs.existsSync(basePath)) {
    console.error('Base path does not exist:', basePath);
    return null;
  }

  const folders = fs.readdirSync(basePath);
  const yourPhoneFolder = folders.find((folder) =>
    folder.startsWith('Microsoft.YourPhone_')
  );
  if (!yourPhoneFolder) return null;

  const dbPath = path.join(basePath, yourPhoneFolder, 'LocalCache', 'Indexed');
  if (!fs.existsSync(dbPath)) return null;

  const indexedFolders = fs.readdirSync(dbPath);
  for (const folder of indexedFolders) {
    const dbFile = path.join(dbPath, folder, 'System', 'Database', 'calling.db');
    if (fs.existsSync(dbFile)) return dbFile;
  }

  return null;
}

function saveJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function loadJSON(filePath) {
  if (fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch {
      return {};
    }
  }
  return {};
}

let lastStartTime = 0;

function checkForNewCall() {
  return new Promise((resolve, reject) => {
    const DB_PATH = findCallingDbPath();
    if (!DB_PATH || !fs.existsSync(DB_PATH)) {
      return reject(new Error('Database path not found'));
    }

    const db = new sqlite3.Database(DB_PATH);

    db.get(
      `SELECT phone_number, start_time, duration FROM call_history ORDER BY start_time DESC LIMIT 1`,
      [],
      (err, row) => {
        db.close();

        if (err) return reject(err);

        if (!row) return resolve(null); // no calls yet

        const { phone_number, start_time, duration } = row;

        if (start_time === lastStartTime) {
          // No new call
          return resolve(null);
        }

        lastStartTime = start_time;

        let startTimeFormatted = "Invalid timestamp";
        try {
          const unixTime = Math.floor(start_time / 10000000 - 11644473600);
          startTimeFormatted = new Date(unixTime * 1000).toISOString();
        } catch {
          // keep invalid timestamp
        }

        const logEntry = {
          phone_number: phone_number || "unknown",
          start_time: startTimeFormatted,
          duration_seconds: duration || 0,
        };

        // Load existing logs and append
        const logs = loadJSON(LOG_FILE);
        logs.entries = logs.entries || [];
        logs.entries.push(logEntry);
        saveJSON(LOG_FILE, logs);

        resolve(logEntry);
      }
    );
  });
}

function startMonitoring(intervalMs = 5000, onNewCall) {
  console.log("🔍 Monitoring for new completed calls...");
  checkForNewCall()
    .then((log) => {
      if (log && onNewCall) onNewCall(log);
    })
    .catch((err) => {
      console.error('❌ Error during call check:', err.message);
    });

  return setInterval(() => {
    checkForNewCall()
      .then((log) => {
        if (log && onNewCall) onNewCall(log);
      })
      .catch((err) => {
        console.error('❌ Error during call check:', err.message);
      });
  }, intervalMs);
}


module.exports = {
  findCallingDbPath,
  checkForNewCall,
  startMonitoring,
};
