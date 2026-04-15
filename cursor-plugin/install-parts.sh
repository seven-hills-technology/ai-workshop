#!/usr/bin/env sh
# Workshop fallback installer.
#
# Installs the plugin's skills / agents / rule individually into Cursor's
# canonical user-scoped scan paths (~/.cursor/skills, ~/.cursor/agents,
# ~/.cursor/rules) by symlinking each one out of this plugin folder.
#
# Use this when the proper plugin install (./install.sh) doesn't get picked up
# by your Cursor build. Re-run with --force to replace existing entries.

set -eu

PLUGIN_DIR="$(cd "$(dirname "$0")" && pwd -P)"

SKILLS_SRC="$PLUGIN_DIR/skills"
AGENTS_SRC="$PLUGIN_DIR/agents"
RULES_SRC="$PLUGIN_DIR/rules"

SKILLS_DST="$HOME/.cursor/skills"
AGENTS_DST="$HOME/.cursor/agents"
RULES_DST="$HOME/.cursor/rules"

FORCE=0
if [ $# -gt 0 ]; then
  case "$1" in
    --force|-f)
      FORCE=1
      ;;
    -h|--help)
      cat <<EOF
Usage: $0 [--force]

Installs each workshop-agents skill, agent, and rule as an individual symlink
under Cursor's canonical scan paths:

  ~/.cursor/skills/<skill-name>/   <- one per skill folder
  ~/.cursor/agents/<agent-name>.md <- one per agent file
  ~/.cursor/rules/<rule-name>.mdc  <- one per rule file

Use this when the proper plugin install (./install.sh) doesn't load in your
Cursor build.

Options:
  --force, -f   Replace existing entries at the destination paths.
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

mkdir -p "$SKILLS_DST" "$AGENTS_DST" "$RULES_DST"

INSTALLED_SKILLS=""
INSTALLED_AGENTS=""
INSTALLED_RULES=""
SKIPPED=""

# Symlink one entry. $1 = source, $2 = destination, $3 = label for messaging.
link_one() {
  src="$1"
  dst="$2"
  label="$3"
  if [ -e "$dst" ] || [ -L "$dst" ]; then
    if [ "$FORCE" -eq 0 ]; then
      SKIPPED="$SKIPPED  - $label\n"
      return 0
    fi
    rm -rf "$dst"
  fi
  ln -s "$src" "$dst"
}

# Skills (folders).
for src in "$SKILLS_SRC"/*/; do
  [ -d "$src" ] || continue
  name="$(basename "$src")"
  dst="$SKILLS_DST/$name"
  if link_one "${src%/}" "$dst" "skill: $name"; then
    case "$dst" in
      "$SKILLS_DST/$name")
        if [ -L "$dst" ] && [ "$(readlink "$dst")" = "${src%/}" ]; then
          INSTALLED_SKILLS="$INSTALLED_SKILLS  - $name\n"
        fi
        ;;
    esac
  fi
done

# Agents (files).
for src in "$AGENTS_SRC"/*.md; do
  [ -f "$src" ] || continue
  name="$(basename "$src")"
  dst="$AGENTS_DST/$name"
  if link_one "$src" "$dst" "agent: $name"; then
    if [ -L "$dst" ] && [ "$(readlink "$dst")" = "$src" ]; then
      INSTALLED_AGENTS="$INSTALLED_AGENTS  - $name\n"
    fi
  fi
done

# Rules (files).
for src in "$RULES_SRC"/*.mdc; do
  [ -f "$src" ] || continue
  name="$(basename "$src")"
  dst="$RULES_DST/$name"
  if link_one "$src" "$dst" "rule: $name"; then
    if [ -L "$dst" ] && [ "$(readlink "$dst")" = "$src" ]; then
      INSTALLED_RULES="$INSTALLED_RULES  - $name\n"
    fi
  fi
done

echo "Installed (symlinks under ~/.cursor/):"
echo
[ -n "$INSTALLED_SKILLS" ] && { echo "  Skills:";  printf "%b" "$INSTALLED_SKILLS"; echo; }
[ -n "$INSTALLED_AGENTS" ] && { echo "  Agents:";  printf "%b" "$INSTALLED_AGENTS"; echo; }
[ -n "$INSTALLED_RULES" ]  && { echo "  Rules:";   printf "%b" "$INSTALLED_RULES";  echo; }

if [ -n "$SKIPPED" ]; then
  echo "Skipped (already exist; re-run with --force to replace):"
  printf "%b" "$SKIPPED"
  echo
fi

cat <<EOF
Next:
  1. In Cursor, run 'Developer: Reload Window' (from the command palette).
  2. Try the new slash commands:
       /workshop-plan
       /workshop-work
       /workshop-review

To uninstall, remove the symlinks (each will only ever point back into this
plugin folder):
  for f in workshop-plan workshop-work workshop-review; do
    rm -f "\$HOME/.cursor/skills/\$f"
  done
  for f in nestjs-backend angular-frontend node-reviewer typescript-reviewer \\
           agent-smith performance-oracle code-simplicity-reviewer \\
           repo-research-analyst framework-docs-researcher; do
    rm -f "\$HOME/.cursor/agents/\$f.md"
  done
  rm -f "\$HOME/.cursor/rules/workshop-conventions.mdc"
EOF
