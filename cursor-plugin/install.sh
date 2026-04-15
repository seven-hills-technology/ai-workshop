#!/usr/bin/env sh
# Install the workshop-agents Cursor plugin via a symlink into ~/.cursor/plugins/local/.
# Re-run with --force to replace an existing install.

set -eu

PLUGIN_NAME="workshop-agents"
PLUGIN_DIR="$(cd "$(dirname "$0")" && pwd -P)"
TARGET_DIR="$HOME/.cursor/plugins/local"
TARGET="$TARGET_DIR/$PLUGIN_NAME"

FORCE=0
if [ $# -gt 0 ]; then
  case "$1" in
    --force|-f)
      FORCE=1
      ;;
    -h|--help)
      cat <<EOF
Usage: $0 [--force]

Symlinks the workshop-agents Cursor plugin into ~/.cursor/plugins/local/.
After install, reload Cursor (Developer: Reload Window) to pick up the plugin.

Options:
  --force, -f   Replace an existing install at ~/.cursor/plugins/local/$PLUGIN_NAME.
  -h, --help    Show this help.
EOF
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      echo "Run with --help for usage." >&2
      exit 2
      ;;
  esac
fi

mkdir -p "$TARGET_DIR"

if [ -e "$TARGET" ] || [ -L "$TARGET" ]; then
  if [ "$FORCE" -eq 0 ]; then
    echo "Already installed at $TARGET." >&2
    echo "Re-run with --force to replace it, or remove it manually:" >&2
    echo "  rm \"$TARGET\"" >&2
    exit 1
  fi
  rm -f "$TARGET"
fi

ln -s "$PLUGIN_DIR" "$TARGET"

cat <<EOF
Installed workshop-agents at:
  $TARGET -> $PLUGIN_DIR

Next:
  1. In Cursor, run 'Developer: Reload Window' (from the command palette).
  2. Try the new slash commands:
       /workshop-plan
       /workshop-work
       /workshop-review

To uninstall:
  rm "$TARGET"
EOF
