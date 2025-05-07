const fetch = require('node-fetch');  // Import node-fetch (version 2)

const notifyTaskComplete = async (clientId, taskType, resultData, taskId, API_URL) => {
    console.log("Notification WH Hit!");
    try {
        const response = await fetch(`${API_URL}/api/webhook/task-complete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                clientId,
                taskType,
                success: true,
                resultData,
                taskId
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log("Success sending notification to server >> ", clientId, taskType, taskId);
    } catch (err) {
        console.error('❌ Failed to call webhook:', err.message);
    } 
};

module.exports = {
    notifyTaskComplete
};
