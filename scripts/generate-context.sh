#!/bin/bash
set -e

# scope output — leave empty for full monorepo
# SCOPE=("client" "shared") two folders
SCOPE=("client" "shared")

# join with | for grep
SCOPE_PATTERN=$(IFS='+'; echo "${SCOPE[*]}")
SCOPE_GREP=$(IFS='|'; echo "${SCOPE[*]}")
OUTPUT_FILENAME="${SCOPE_PATTERN:+${SCOPE_PATTERN}_}context.txt"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

# reusable filter
filtered_files() {
  git ls-files \
    | grep -E '\.(ts|tsx|js|jsx|css|md|json|kt|xml|yml|sh|sql)$|^Dockerfile$|mobile/android/(build\.gradle|gradle\.properties|settings\.gradle|gradlew(\.bat)?|app/build\.gradle|gradle/wrapper/gradle-wrapper\.(jar|properties))$' \
    | grep -Ev '(package-lock\.json|bun\.lock|gradle-wrapper\.jar)$|drizzle/meta/' \
    | { [ -n "$SCOPE_GREP" ] && grep -E "^(${SCOPE_GREP})/" || cat; }
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
} > "${PROJECT_ROOT}/${OUTPUT_FILENAME}"

echo "✅ Done: $OUTPUT_FILENAME ($(wc -l < "${PROJECT_ROOT}/${OUTPUT_FILENAME}" | tr -d ' ') lines)"
