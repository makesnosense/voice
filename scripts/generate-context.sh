#!/bin/bash
set -e

# scope output — leave empty for full monorepo
# SCOPE=("client" "shared") two folders
SCOPE=("client" "shared")

# join with | for grep
SCOPE_PATTERN=$(IFS='+'; echo "${SCOPE[*]}")
OUTPUT_FILE="${SCOPE_PATTERN:+${SCOPE_PATTERN}_}context.txt"

SCRIPT_DIR="$(dirname "$0")"
PROJECT_ROOT="$SCRIPT_DIR/.."

cd "$PROJECT_ROOT"

# reusable filter
filtered_files() {
  git ls-files \
    | grep -E '\.(ts|tsx|js|jsx|css|md|json|kt|xml|yml|sh|sql)$|^Dockerfile$|mobile/android/(build\.gradle|gradle\.properties|settings\.gradle|gradlew(\.bat)?|app/build\.gradle|gradle/wrapper/gradle-wrapper\.(jar|properties))$' \
    | grep -Ev '(package-lock\.json|bun\.lock|gradle-wrapper\.jar)$|drizzle/meta/' \
    | { [ -n "$SCOPE_PATTERN" ] && grep -E "^(${SCOPE_PATTERN})/" || cat; } \
}

{
  echo "# Voice monorepo context — $(date +%Y-%m-%d)"
  echo "# $(git ls-files | wc -l | tr -d ' ') total tracked files"
  echo ""
  echo "# included files by directory:"
  filtered_files \
    | awk -F/ '{
        if (NF >= 3) print $1"/"$2
        else if (NF == 2) print $1
        else print "(root)"
      }' \
    | sort | uniq -c \
    | sort -k2 \
    | awk '{printf "#   %-40s %s %s\n", $2"/", $1, ($1==1 ? "file" : "files")}'
  echo ""
  filtered_files \
    | sort \
    | xargs -I{} sh -c 'echo "=== {} ===" && cat "{}"'
} > "$OUTPUT_FILE"

echo "✅ Done: $OUTPUT_FILE ($(wc -l < "$OUTPUT_FILE" | tr -d ' ') lines)"
