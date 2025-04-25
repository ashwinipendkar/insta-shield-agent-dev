
const { io } = require("socket.io-client");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");

// Import your custom modules
const screenshotModule = require("./modules/screenshot");
const { notifyTaskComplete } = require("./api/notifyTaskComplete");
// const locationModule = require("./modules/location");
// const historyModule = require("./modules/browserHistory");

const API_URL = "http://localhost:8080";
const CLIENT_ID = "client-1234";

console.log("Starting client agent...");

const socket = io(API_URL, {
  query: {
    clientId: CLIENT_ID
  },
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 5000
});

socket.on("connect", () => {
  console.log("Connected to API server via socket");
});

socket.on("disconnect", () => {
  console.warn("Disconnected from API server. Retrying...");
});

// Event handlers for various tasks
socket.on("task", async (data) => {
  console.log("Received task:", data);

  const { type, payload , taskId} = data;

  try {
    let resultData;
    switch (type) {
      case "screenshot":
        resultData = await screenshotModule.captureScreenshot()
        resultData=resultData.base64Image;
        console.log("Screenshot Clicked! >>");

        break;

      case "location":
        // resultPath = await locationModule.capture();
        break;

      case "browser-history":
        // resultPath = await historyModule.capture();
        break;

      default:
        console.error("Unknown task type:", type);
        return;
    }

    // Send task Status notification to server
    notifyTaskComplete(CLIENT_ID,type,resultData, taskId)

  } catch (err) {
    console.error(`Error processing task ${type}:`, err);
  }
});
