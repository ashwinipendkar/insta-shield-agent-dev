const fs = require('fs/promises');
const fetch = require('node-fetch');
const { DEV_BASE_URL } = require('../constants/constants');

const hostsPath = 'C:\\Windows\\System32\\drivers\\etc\\hosts';

const whitelist = [
  'example.com',
  'google.com',
  'chatgpt.com',
  'www.instaconnectcrm.com'
];

const extractDomain = (url) => {
  try {
    const { hostname } = new URL(url);
    return hostname.replace(/^www\./, '');
  } catch (err) {
    console.warn(`Invalid URL skipped: ${url}`);
    return null;
  }
};

const websiteBlocker = async (clientId, API_URL) => {
  let content = `# Whitelist-based URL control\n`;

  try {
    const apiUrl = `${API_URL}/api/blocked-websites/${clientId}`;
    console.log("Fetching from:", apiUrl);

    const response = await fetch(apiUrl);

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    const rawBody = await response.text();

    const jsonData = JSON.parse(rawBody);
    const websiteEntries = jsonData?.data?.[0]?.websites || [];

    console.log("Blocked website URLs:");
    websiteEntries.forEach(site => {
      console.log("-", site.url);
    });

    websiteEntries.forEach(site => {
      const domain = extractDomain(site.url);
      if (domain && !whitelist.some(wl => domain.includes(wl))) {
        content += `127.0.0.1 ${domain}\n`;
        content += `127.0.0.1 www.${domain}\n`;
      }
    });

    await fs.writeFile(hostsPath, content, { encoding: 'utf8' });
    console.log('Whitelist applied to hosts file.');
  } catch (err) {
    console.error('Error applying website block:', err.message);
  }

  return content;
};

module.exports = {
  websiteBlocker,
};
