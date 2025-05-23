


const activeWin = require('active-win');

async function logActiveApp() {
  try {
    const result = await activeWin();
    console.clear();
    console.log('Active App Info:');
    console.log(`Title: ${result.title}`);
    console.log(`App: ${result.owner.name}`);
    console.log(`Process ID: ${result.owner.processId}`);
    console.log(`Path: ${result.owner.path}`);
  } catch (err) {
    console.error('Error fetching active window info:', err);
  }
}

// Log every 2 seconds
setInterval(logActiveApp, 2000);
