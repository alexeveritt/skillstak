#!/usr/bin/env node
// Got fed up with having to kill open node ports manually, so created
// this script to do it for me.

const { exec } = require("child_process");

// Retrieve the port number from the command line arguments
const port = process.argv[2];

if (!port) {
  console.error("Please provide a port number to kill.");
  process.exit(1);
}

// Find and kill the process running on the specified port
const command = `lsof -t -i:${port} | xargs kill -9`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: Could not kill process on port ${port}.`);
    console.error(error.message);
    process.exit(1);
  }

  if (stderr) {
    console.error(`Warning: ${stderr}`);
  }

  console.log(`Successfully killed process on port ${port}.`);
});
