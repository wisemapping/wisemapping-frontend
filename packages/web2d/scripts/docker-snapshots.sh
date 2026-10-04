#!/usr/bin/env bash
#
# Runs web2d's Storybook + Cypress pixel snapshots inside the pinned cypress/included image.
# Started by docker-compose.snapshots.yml (verify) and docker-compose.snapshots.update.yml
# (update). The repository is mounted at /e2e; node_modules, the Yarn cache and the Yarn install
# state live in Docker volumes, so nothing Linux-specific is written to the host checkout.
set -euo pipefail

cd /e2e

export COREPACK_ENABLE_DOWNLOAD_PROMPT=0
export YARN_CACHE_FOLDER=/root/.yarn-cache
export YARN_INSTALL_STATE_PATH=/root/.yarn-state/install-state.gz
export YARN_ENABLE_TELEMETRY=0
# The image already has the Cypress 16.1.1 binary.
export CYPRESS_INSTALL_BINARY=0

corepack enable

# Install only what web2d needs (the root workspace and web2d), once per yarn.lock.
LOCK_HASH="$(sha256sum yarn.lock | cut -d' ' -f1)"
MARKER=node_modules/.web2d-snapshots-lock
if [ "$(cat "$MARKER" 2>/dev/null || true)" != "$LOCK_HASH" ] || [ ! -f "$YARN_INSTALL_STATE_PATH" ]; then
  echo "Installing dependencies for web2d (yarn.lock ${LOCK_HASH:0:12})..."
  yarn workspaces focus wisemapping-front-end @wisemapping/web2d
  echo "$LOCK_HASH" > "$MARKER"
fi

echo "Fonts: $(fc-match Arial) | $(fc-match Verdana) | $(fc-match Times)"
echo "Snapshots: compare=${CYPRESS_imageSnaphots:-false} update=${CYPRESS_updateSnapshots:-false}"

cd packages/web2d
# Storybook on web2d's port (6106) + cypress run --browser chrome.
exec yarn test:integration "$@"
