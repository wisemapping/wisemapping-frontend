#!/usr/bin/env bash
#
# Concurrency test for the pre-commit hook (lint-staged), see BL-38.
#
# Builds a throwaway repository with several worktrees, copies this repo's
# `.husky/pre-commit` and the `lint-staged` config from `package.json` into it,
# and runs `git commit` in every worktree at the same moment, for a few rounds.
# Each worktree has staged changes plus unstaged changes (in a partially staged
# file and in an unstaged file) and an untracked file. A quarter of the worktrees
# stage a file with an ESLint error and another quarter a file Prettier would
# reformat, so their commits must fail.
#
# It checks that:
#   - clean commits succeed and record exactly the staged content;
#   - failing commits are refused and leave the index as it was;
#   - no worktree file changes (staged, unstaged or untracked);
#   - `git stash list` (shared by all worktrees) is untouched, including a
#     stash entry that existed before;
#   - lint-staged leaves no temporary files in any worktree's git dir.
#
# Usage: scripts/test-precommit-concurrency.sh [SOURCE_DIR]
#   SOURCE_DIR  where `.husky/pre-commit` and `package.json` are taken from
#               (default: this repository).
#   WORKTREES=8 ROUNDS=3 KEEP_TMP=1 VERBOSE=1  optional environment overrides.
#
# Exit code 0 when every check passes, 1 otherwise.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE="$(cd "${1:-$REPO_ROOT}" && pwd)"
WORKTREES="${WORKTREES:-8}"
ROUNDS="${ROUNDS:-3}"
NODE_MODULES="$(cd "$REPO_ROOT/node_modules" && pwd -P)"
WEB2D_NODE_MODULES=""
if [ -d "$REPO_ROOT/packages/web2d/node_modules" ]; then
  WEB2D_NODE_MODULES="$(cd "$REPO_ROOT/packages/web2d/node_modules" && pwd -P)"
fi

TMP="$(cd "$(mktemp -d "${TMPDIR:-/tmp}/precommit-concurrency.XXXXXX")" && pwd -P)"
if [ "${KEEP_TMP:-}" = "1" ]; then
  echo "Keeping $TMP"
else
  trap 'rm -rf "$TMP"' EXIT
fi

unset HUSKY GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE
export GIT_CONFIG_NOSYSTEM=1
export GIT_AUTHOR_NAME=test GIT_AUTHOR_EMAIL=test@example.com
export GIT_COMMITTER_NAME=test GIT_COMMITTER_EMAIL=test@example.com

# The hook runs `yarn lint-staged ...`; the temporary repo is not a Yarn
# project, so a shim forwards that call to the installed lint-staged.
mkdir -p "$TMP/bin"
cat >"$TMP/bin/yarn" <<EOF
#!/bin/sh
if [ "\$1" = "lint-staged" ]; then
  shift
  exec node "$NODE_MODULES/lint-staged/bin/lint-staged.js" "\$@"
fi
echo "yarn shim: unsupported command: \$*" >&2
exit 1
EOF
chmod +x "$TMP/bin/yarn"
export PATH="$TMP/bin:$PATH"

FAILURES=0
check() {
  # check <description> <command...>
  local description="$1"
  shift
  if "$@"; then
    echo "  ok    $description"
  else
    echo "  FAIL  $description"
    FAILURES=$((FAILURES + 1))
  fi
}

link_node_modules() {
  ln -s "$NODE_MODULES" "$1/node_modules"
  if [ -n "$WEB2D_NODE_MODULES" ]; then
    ln -s "$WEB2D_NODE_MODULES" "$1/packages/web2d/node_modules"
  fi
}

# --- Main repository -------------------------------------------------------
MAIN="$TMP/main"
mkdir -p "$MAIN/.husky" "$MAIN/packages/web2d/src" "$MAIN/docs"
cp "$SOURCE/.husky/pre-commit" "$MAIN/.husky/pre-commit"
cp "$SOURCE/package.json" "$MAIN/package.json"
cp "$REPO_ROOT/.prettierrc.json" "$REPO_ROOT/.prettierignore" "$MAIN/"
cp "$REPO_ROOT/packages/web2d/eslint.config.mjs" "$REPO_ROOT/packages/web2d/package.json" \
  "$MAIN/packages/web2d/"
printf 'node_modules\n' >"$MAIN/.gitignore"
printf 'export const base = 1;\n' >"$MAIN/packages/web2d/src/Clean.ts"
printf '# Notes\n\nBase.\n' >"$MAIN/docs/notes.md"
printf '# Log\n\n- base\n' >"$MAIN/docs/log.md"

git -C "$MAIN" init -q -b main
git -C "$MAIN" config commit.gpgsign false
git -C "$MAIN" add -A
git -C "$MAIN" commit -q --no-verify -m "initial"

# Install the hooks the way husky does, with an absolute hooksPath so that every
# worktree runs the main checkout's `.husky/pre-commit` (as in this repository).
(cd "$MAIN" && node "$NODE_MODULES/husky/bin.js" >/dev/null)
git -C "$MAIN" config core.hooksPath "$MAIN/.husky/_"

# A developer's own stash entry that must survive.
printf 'Stashed by the developer.\n' >>"$MAIN/docs/notes.md"
git -C "$MAIN" stash push -q -m "developer stash"
STASH_BEFORE="$(git -C "$MAIN" stash list --format='%H %gs')"

for i in $(seq 1 "$WORKTREES"); do
  git -C "$MAIN" worktree add -q -b "wt$i" "$TMP/wt$i"
  link_node_modules "$TMP/wt$i"
done

# Tree of the whole working tree (tracked + untracked, not ignored), computed
# with a private index so the real one is not touched.
worktree_tree() {
  local index="$TMP/tree-index.$(basename "$1")"
  (
    cd "$1"
    export GIT_INDEX_FILE="$index"
    git read-tree HEAD
    git add -A
    git write-tree
  )
  rm -f "$index"
}

# --- Rounds --------------------------------------------------------------
for round in $(seq 1 "$ROUNDS"); do
  echo "Round $round: $WORKTREES concurrent commits"
  rm -f "$TMP/go"

  for i in $(seq 1 "$WORKTREES"); do
    wt="$TMP/wt$i"
    if [ $((i % 4)) -eq 1 ]; then
      # Fails ESLint (unused variable).
      printf 'const unused%s = %s;\n' "$round" "$i" >>"$wt/packages/web2d/src/Clean.ts"
      echo fail >"$TMP/expect$i"
    elif [ $((i % 4)) -eq 2 ]; then
      # Fails `prettier --check` (Prettier would rewrite the list marker spacing).
      printf 'export const value%s = %s;\n' "$round" "$i" >>"$wt/packages/web2d/src/Clean.ts"
      printf -- '-   round %s\n' "$round" >>"$wt/docs/log.md"
      echo fail >"$TMP/expect$i"
    else
      printf 'export const value%s = %s;\n' "$round" "$i" >>"$wt/packages/web2d/src/Clean.ts"
      printf -- '- round %s\n' "$round" >>"$wt/docs/log.md"
      echo pass >"$TMP/expect$i"
    fi
    git -C "$wt" add packages/web2d/src/Clean.ts docs/log.md
    # Unstaged: on top of the staged file (partially staged) and in another file.
    printf 'export const unstaged%s = %s;\n' "$round" "$i" >>"$wt/packages/web2d/src/Clean.ts"
    printf 'Unstaged %s.\n' "$round" >>"$wt/docs/notes.md"
    printf 'untracked %s\n' "$round" >"$wt/untracked-$round.txt"

    git -C "$wt" rev-parse HEAD >"$TMP/head$i"
    git -C "$wt" write-tree >"$TMP/index$i"
    worktree_tree "$wt" >"$TMP/tree$i"

    (
      cd "$wt"
      while [ ! -f "$TMP/go" ]; do sleep 0.01; done
      if git commit -q -m "round $round" >"$TMP/log$i" 2>&1; then
        echo 0 >"$TMP/rc$i"
      else
        echo 1 >"$TMP/rc$i"
      fi
    ) &
  done

  touch "$TMP/go"
  wait

  for i in $(seq 1 "$WORKTREES"); do
    wt="$TMP/wt$i"
    expect="$(cat "$TMP/expect$i")"
    rc="$(cat "$TMP/rc$i")"
    index_after="$(git -C "$wt" write-tree)"
    tree_after="$(worktree_tree "$wt")"
    if [ "$expect" = pass ]; then
      check "wt$i commits" test "$rc" = 0
      check "wt$i commit holds exactly the staged content" \
        test "$(git -C "$wt" rev-parse 'HEAD^{tree}')" = "$(cat "$TMP/index$i")"
    else
      check "wt$i commit is refused" test "$rc" = 1
      check "wt$i HEAD is unchanged" test "$(git -C "$wt" rev-parse HEAD)" = "$(cat "$TMP/head$i")"
    fi
    check "wt$i index is unchanged" test "$index_after" = "$(cat "$TMP/index$i")"
    check "wt$i working tree (unstaged and untracked) is unchanged" \
      test "$tree_after" = "$(cat "$TMP/tree$i")"
    check "wt$i has no lint-staged leftovers" \
      test -z "$(ls -A "$(git -C "$wt" rev-parse --absolute-git-dir)/lint-staged" 2>/dev/null)"
    if [ "$rc" != 0 ] && [ "$expect" = pass ] || [ "${VERBOSE:-}" = 1 ]; then
      sed 's/^/        /' "$TMP/log$i"
    fi

    # Next round starts from a clean state on top of this worktree's HEAD.
    git -C "$wt" reset -q --hard HEAD
    git -C "$wt" clean -q -f
  done

  check "git stash list is untouched" \
    test "$(git -C "$MAIN" stash list --format='%H %gs')" = "$STASH_BEFORE"
done

if [ "$FAILURES" -eq 0 ]; then
  echo "All checks passed."
else
  echo "$FAILURES check(s) failed."
  exit 1
fi
