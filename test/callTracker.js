const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const os = require('os');

const INSTALLER_JSON = "C:/InstallerData/installer_data.json";
const LOG_FILE = "C:/Logs/phone_logs/simple_call_log.json";

// Ensure directory exists
fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });

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

function saveJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function getDbPath() {
  const installerData = loadJSON(INSTALLER_JSON);
  return installerData.callingDbPath || '';
}

function getLatestCallDetails() {
  const dbPath = getDbPath();
  if (!dbPath || !fs.existsSync(dbPath)) {
    console.error("❌ DB path not found.");
    return;
  }

  const db = new sqlite3.Database(dbPath);
  db.get("SELECT phone_number, start_time, duration FROM call_history ORDER BY start_time DESC LIMIT 1", [], (err, row) => {
    db.close();
    if (err || !row) {
      console.error("⚠️ Could not fetch call data.");
      return;
    }

    const logEntry = {
      phone_number: row.phone_number || "unknown",
      start_time: new Date(row.start_time * 1000).toISOString(),
      duration_seconds: row.duration || 0
    };

    console.log("📞 Call Logged:", logEntry);

    let logs = loadJSON(LOG_FILE);
    logs.entries = logs.entries || [];
    logs.entries.push(logEntry);
    saveJSON(LOG_FILE, logs);
  });
}

getLatestCallDetails();
