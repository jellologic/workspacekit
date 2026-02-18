#!/bin/sh
# Patch @tanstack/react-start-config to handle missing 'imports' array in Vite 6 manifest entries.
# See: entryFile.imports and file.imports may be undefined when Vite 6 omits the field.

TARGET=$(find node_modules -path "*/@tanstack/react-start-config/dist/esm/index.js" -type f 2>/dev/null | head -1)
if [ -n "$TARGET" ]; then
  sed -i.bak 's/file\.imports\.map/\(file.imports || []\).map/g; s/entryFile\.imports\.map/\(entryFile.imports || []\).map/g' "$TARGET"
  rm -f "${TARGET}.bak"
  echo "[patch-deps] Patched $TARGET"
fi
