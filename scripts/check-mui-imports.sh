#!/bin/bash
#
# This script checks for Material UI imports that prevent tree shaking.
# Bad: import { Button } from '@mui/material';
# Good: import Button from '@mui/material/Button';
#
# Exit codes:
# 0 - No problematic imports found
# 1 - Problematic imports found

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Checking for Material UI imports that prevent tree shaking..."

# Find all TypeScript/JavaScript files, excluding node_modules and dist
FILES=$(find "$REPO_ROOT/packages" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/dist/*" \
  ! -path "*/build/*" \
  ! -path "*/.next/*")

PROBLEMS_FOUND=0
PROBLEM_FILES=()

# Pattern to match destructured imports from @mui/material (but not from subpaths or /styles)
# This matches: import { X } from '@mui/material';
# But not: import { styled } from '@mui/material/styles';
# But not: import { PaletteMode } from '@mui/material'; when it's a type import

for file in $FILES; do
  # Check for problematic patterns
  # Look for imports that have curly braces and import from '@mui/material' directly
  # Exclude type imports (import type { ... })
  # Exclude imports from subpaths like '@mui/material/styles'
  PROBLEMATIC_LINES=$(grep -n "^import {.*} from ['\"]@mui/material['\"];" "$file" 2>/dev/null | grep -v "^import type {" || true)
  
  if [ -n "$PROBLEMATIC_LINES" ]; then
    PROBLEMS_FOUND=1
    PROBLEM_FILES+=("$file")
    echo -e "${RED}✗${NC} Found problematic imports in: ${YELLOW}${file#$REPO_ROOT/}${NC}"
    echo "$PROBLEMATIC_LINES" | while read -r line; do
      echo "  $line"
    done
    echo ""
  fi
done

if [ $PROBLEMS_FOUND -eq 0 ]; then
  echo -e "${GREEN}✓${NC} No problematic Material UI imports found!"
  echo "All imports are tree-shakeable."
  exit 0
else
  echo -e "${RED}✗${NC} Found problematic Material UI imports in ${#PROBLEM_FILES[@]} file(s)."
  echo ""
  echo "To fix these issues, change destructured imports to default imports:"
  echo ""
  echo "  ${RED}Bad:${NC}  import { Button, Box } from '@mui/material';"
  echo "  ${GREEN}Good:${NC} import Button from '@mui/material/Button';"
  echo "        import Box from '@mui/material/Box';"
  echo ""
  echo "  ${RED}Bad:${NC}  import { PaletteMode } from '@mui/material';"
  echo "  ${GREEN}Good:${NC} import type { PaletteMode } from '@mui/material';"
  echo ""
  echo "For types, use 'import type' syntax to allow them to be imported from the barrel file."
  echo ""
  exit 1
fi

