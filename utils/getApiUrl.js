const fetch = require("node-fetch");
const { DEV_BASE_URL } = require("../constants/constants");

async function getApiUrlFromRemote() {
  // const endpoint = "https://insta-shield-url-redirection.vercel.app/tunnel-url";

  try {
    const res = await fetch(endpoint);

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    const data = await res.json();

    if (data.tunnelUrl) {
      console.log("API URL:", DEV_BASE_URL);

      return DEV_BASE_URL;
      // return data.tunnelUrl;
    } else {
      throw new Error("Missing 'tunnelUrl' in response");
    }
  } catch (err) {
    console.log("Error fetching API URL:", err);
    return DEV_BASE_URL;

    throw new Error(`Failed to fetch API URL: ${err.message}`);
  }
}

module.exports = { getApiUrlFromRemote };
