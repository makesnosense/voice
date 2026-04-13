#!/bin/bash
set -e

SCRIPT_DIR="$(dirname "$0")"
PROJECT_ROOT="$SCRIPT_DIR/.."

OUTPUT_FILE="context.txt"

cd "$PROJECT_ROOT"


{
  echo "# Voice monorepo context — $(date +%Y-%m-%d)"
  echo "# $(git ls-files | wc -l | tr -d ' ') total tracked files"
  echo ""

  git ls-files \
    | grep -E '\.(ts|tsx|js|jsx|css|md|json|kt|xml|yml|sh|sql)$|^Dockerfile$|mobile/android/(build\.gradle|gradle\.properties|settings\.gradle|gradlew(\.bat)?|app/build\.gradle|gradle/wrapper/gradle-wrapper\.(jar|properties))$' \
    | grep -Ev '(package-lock\.json|bun\.lock|gradle-wrapper\.jar)$|drizzle/meta/' \
    | sort \
    | xargs -I{} sh -c 'echo "=== {} ===" && cat "{}"'
} > "$OUTPUT_FILE"

echo "✅ Done: $OUTPUT_FILE ($(wc -l < "$OUTPUT_FILE" | tr -d ' ') lines)"
