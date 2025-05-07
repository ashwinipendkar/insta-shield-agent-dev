const fetch = require("node-fetch");

async function getApiUrlFromRemote() {
  const endpoint = "https://insta-shield-url-redirection.vercel.app/tunnel-url";

  try {
    const res = await fetch(endpoint);
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    const data = await res.json();

    if (data.tunnelUrl) {
      return data.tunnelUrl;
    } else {
      throw new Error("Missing 'tunnelUrl' in response");
    }
  } catch (err) {
    throw new Error(`Failed to fetch API URL: ${err.message}`);
  }
}

module.exports = { getApiUrlFromRemote };
