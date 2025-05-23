const sudo = require('sudo-prompt');
const path = require('path');

// ✅ Clean environment variables to avoid issues like "CommonProgramFiles(x86)"
const cleanEnv = Object.fromEntries(
  Object.entries(process.env).filter(([key]) => /^[A-Z_][A-Z0-9_]*$/i.test(key))
);

const options = {
  name: 'InstaShield Agent',
  env: cleanEnv,
};

const indexScript = path.join(__dirname, 'index.js');

sudo.exec(`node "${indexScript}"`, options, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Failed to start with admin privileges:', error);
    return;
  }
  console.log(stdout);
});
