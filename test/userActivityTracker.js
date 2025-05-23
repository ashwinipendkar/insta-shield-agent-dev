const { spawn } = require('child_process');

const py = spawn('python', ['idle_detector.py']); // Or 'python3' if needed

py.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(`[Node received] ${output}`); // Show all data from Python

  const lines = output.split('\n');
  lines.forEach(line => {
    if (line.trim()) {
      console.log(`[Status] ${line}`);
    }
  });
});

py.stderr.on('data', (data) => {
  console.error(`[Python error] ${data}`);
});

py.on('close', (code) => {
  console.log(`[Python script exited with code] ${code}`);
});
