const { spawn } = require('node:child_process');

const DEFAULT_PORT = Number.parseInt(process.env.PORT || '6006', 10);

async function main() {
  const port = DEFAULT_PORT;
  const baseUrl = `http://127.0.0.1:${port}`;
  const npxBin = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const child = spawn(
    npxBin,
    [
      'start-server-and-test',
      `yarn exec storybook dev --port ${port} --no-open --quiet`,
      `http-get://127.0.0.1:${port}`,
      'yarn cy:run',
    ],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        PORT: String(port),
        CYPRESS_BASE_URL: baseUrl,
        CI: '1',
        STORYBOOK_DISABLE_TELEMETRY: '1',
      },
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
