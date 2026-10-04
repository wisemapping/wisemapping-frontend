/**
 * Starts a dev server (Storybook by default) on PORT, runs Cypress against it and stops it.
 * Used by the `test:integration` and `test:visual*` scripts of web2d, mindplot and editor.
 *
 *   PORT=6107 node ../../scripts/run-storybook-cypress.js
 *   PORT=8081 node ../../scripts/run-storybook-cypress.js --server 'vite --port 8081 --host 127.0.0.1'
 *
 * Options:
 *   --server '<command>'  the server to start (default: Storybook on PORT)
 *   --test '<command>'    the test command (default: `yarn cy:run`)
 *
 * Image snapshots: Cypress compares them in the mode given by VISUAL_SNAPSHOTS (`verify`, the
 * default, or `update`), see each package's cypress/plugins and the "Image-snapshot tests"
 * section of CLAUDE.md.
 */
const { spawn } = require('node:child_process');

const DEFAULT_PORT = Number.parseInt(process.env.PORT || '6006', 10);

const option = (name) => {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
};

async function main() {
  const port = DEFAULT_PORT;
  const baseUrl = `http://127.0.0.1:${port}`;
  const server = option('server') || `yarn exec storybook dev --port ${port} --no-open --quiet`;
  const test = option('test') || 'yarn cy:run';
  const npxBin = process.platform === 'win32' ? 'npx.cmd' : 'npx';

  const env = {
    ...process.env,
    PORT: String(port),
    CYPRESS_BASE_URL: baseUrl,
    CI: '1',
    STORYBOOK_DISABLE_TELEMETRY: '1',
  };
  // Set by Electron-based hosts (editors, agents): it makes the Cypress binary start as plain
  // Node instead of Electron, and `cypress run` then fails before running any spec.
  delete env.ELECTRON_RUN_AS_NODE;

  const child = spawn(
    npxBin,
    ['start-server-and-test', server, `http-get://127.0.0.1:${port}`, test],
    {
      cwd: process.cwd(),
      env,
      stdio: 'inherit',
    },
  );

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? 1);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
