#!/usr/bin/env node
/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       https://github.com/wisemapping/wisemapping-open-source/blob/main/LICENSE.md
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

const net = require('net');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

/**
 * Find an available port starting from the preferred port
 */
async function findAvailablePort(preferredPort) {
  // First, try to kill any process using the preferred port
  try {
    await killProcessOnPort(preferredPort);
  } catch (err) {
    // Ignore errors - process might not exist
  }

  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        // Port is in use, try next port
        resolve(findAvailablePort(preferredPort + 1));
      } else {
        reject(err);
      }
    });

    server.once('listening', () => {
      const { port } = server.address();
      server.close(() => {
        resolve(port);
      });
    });

    server.listen(preferredPort);
  });
}

/**
 * Kill process using the specified port on macOS
 */
async function killProcessOnPort(port) {
  try {
    // Find process ID using the port
    const { stdout } = await execPromise(`lsof -ti:${port}`);
    const pids = stdout.trim().split('\n').filter(Boolean);

    if (pids.length > 0) {
      console.error(`Killing process(es) using port ${port}: ${pids.join(', ')}`);

      // Kill each process
      for (const pid of pids) {
        try {
          await execPromise(`kill -9 ${pid}`);
        } catch (killErr) {
          // Process might already be dead
        }
      }

      // Wait a moment for the port to be freed
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  } catch (err) {
    // No process found or other error - this is fine
  }
}

// Get the preferred port from command line args (required)
if (process.argv.length < 3) {
  console.error('Usage: find-port.js <port>');
  process.exit(1);
}

const preferredPort = parseInt(process.argv[2], 10);

if (isNaN(preferredPort)) {
  console.error('Error: Port must be a number');
  process.exit(1);
}

findAvailablePort(preferredPort)
  .then((port) => {
    console.log(port);
  })
  .catch((err) => {
    console.error('Error finding available port:', err);
    process.exit(1);
  });
