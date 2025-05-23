const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const os = require('os');
const fs = require('fs');

const getRecentBrowserHistory = () => {
  return new Promise((resolve, reject) => {
    const chromeHistoryPath = path.join(
      os.homedir(),
      'AppData/Local/Google/Chrome/User Data/Default/History'
    );

    // Copy DB to avoid lock issue
    const copyPath = path.join(os.tmpdir(), 'History_copy');
    try {
      fs.copyFileSync(chromeHistoryPath, copyPath);
    } catch (err) {
      return reject('Could not copy Chrome history DB: ' + err.message);
    }

    const db = new sqlite3.Database(copyPath);

    db.all(
      `SELECT url, title, last_visit_time FROM urls ORDER BY last_visit_time DESC LIMIT 100`,
      (err, rows) => {
        db.close();
        if (err) return reject('Error reading DB: ' + err.message);

        const history = rows.map((row) => {
          const WINDOWS_EPOCH_IN_UNIX_MS = -11644473600000;
          const visitTime = new Date(row.last_visit_time / 1000 + WINDOWS_EPOCH_IN_UNIX_MS);

          return {
            title: row.title,
            url: row.url,
            visitedAt: visitTime.toISOString(), // ISO format (can also use .toLocaleString())
          };
        });

        resolve(history);
      }
    );
  });
};

module.exports = {
  getRecentBrowserHistory,
};
