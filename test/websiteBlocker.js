const fs = require('fs');
const path = require('path');
const os = require('os');

const blockedDomains = [
  'facebook.com',
  'instagram.com',
  'twitter.com',
  'www.instaconnectcrm.com'
  // add more blocked domains
];

const whitelist = [
  'example.com',
  'google.com',
  'chatgpt.com',
  'www.instaconnectcrm.com'
  // only these should be allowed
];

const hostsPath = 'C:\\Windows\\System32\\drivers\\etc\\hosts';

const applyWhitelist = () => {
  let content = `# Whitelist-based URL control\n`;

  blockedDomains.forEach((domain) => {
    if (!whitelist.some((wl) => domain.includes(wl))) {
      content += `127.0.0.1 ${domain}\n`;
      content += `127.0.0.1 www.${domain}\n`;
    }
  });

  try {
    fs.writeFileSync(hostsPath, content, { encoding: 'utf8' });
    console.log('Whitelist applied to hosts file.');
  } catch (err) {
    console.error('Error writing to hosts file. Run as administrator.', err.message);
  }
};

applyWhitelist();
