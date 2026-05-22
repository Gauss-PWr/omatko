#!/bin/bash
set -e

# Get last tag
last=$(git describe --tags --abbrev=0 2>/dev/null || echo "v13.0.0")
# Strip 'v' and split
IFS='.' read -r edition page patch <<< "${last#v}"

# Ask change type
echo "Last tag: $last"
echo "What type of change?"
echo "  1) New content / section enabled  (bumps page version, resets patch)"
echo "  2) Fix / minor tweak              (bumps patch)"
read -rp "Choice [1/2]: " choice

case $choice in
  1)
    page=$((page + 1))
    patch=0
    ;;
  2)
    patch=$((patch + 1))
    ;;
  *)
    echo "Invalid choice, aborting."
    exit 1
    ;;
esac

new_tag="v$edition.$page.$patch"

# Commit
git add -A
read -rp "Commit message: " msg
git commit -m "$msg"

# Tag & push
git tag "$new_tag"
echo "Tagged: $new_tag"
git push && git push --tags
echo "Deployed: $new_tag"
