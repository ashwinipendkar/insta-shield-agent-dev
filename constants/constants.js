const path = require("path");
const os = require("os");

const BASE_DIR = path.dirname(process.execPath); // Useful when running as exe

let CONSTANTS = {
  CLIENT_ID: "ghost-client",
  BASE_URL: "http://localhost:8080", // change as needed
  // DEV_BASE_URL: "http://192.168.68.100:8080", // change as needed
  DEV_BASE_URL: "https://insta-shield-server-zgo6.onrender.com",
  WEBSITE_BLOCK_URL: `/api/blocked-websites`,

  REDIRECTION_URL: "https://insta-shield-url-redirection.vercel.app/tunnel-url",

  MAIN_EXE_NAME: "main.exe",
  MAIN_EXE_PATH: path.join(BASE_DIR, "main.exe"),

  // Optional: paths for logs, configs, etc.
  LOG_FILE_PATH: path.join(os.homedir(), "InstaShield", "logs", "app.log"),
  CONFIG_PATH: path.join(BASE_DIR, "config.json"),

  // Other constants
  APP_NAME: "InstaShield",
  TIMEOUT: 5000,
};

module.exports = CONSTANTS;
