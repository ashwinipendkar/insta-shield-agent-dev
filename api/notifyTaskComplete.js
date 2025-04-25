const axios = require('axios');

const notifyTaskComplete = async ( clientId, taskType, resultData, taskId ) => {
    console.log("Notification WH Hit!")
  try {
    await axios.post('http://192.168.68.174:8080/api/webhook/task-complete', {
      clientId,
      taskType,
      success: true,
      resultData,
      taskId
    });
    console.log("Success sending notification to server >> ",clientId,taskType,taskId)
  } catch (err) {
    console.error('❌ Failed to call webhook:', err.message);
  }
};

module.exports={
    notifyTaskComplete
}