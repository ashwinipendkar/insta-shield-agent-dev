const axios = require('axios');

const notifyTaskComplete = async ( clientId, taskType, data, taskId ) => {
    console.log(clientId, taskType,data, taskId)
  try {
    await axios.post('http://localhost:8080/api/webhook/task-complete', {
      clientId,
      taskType,
      success: true,
      data,
      taskId
    });
    console.log("Success sending notification to server >> ",clientId, taskType,data)
  } catch (err) {
    console.error('❌ Failed to call webhook:', err.message);
  }
};

module.exports={
    notifyTaskComplete
}