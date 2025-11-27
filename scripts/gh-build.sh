#!/bin/bash
version=$(git describe --tags --match '*-dev' --abbrev=0 2>/dev/null | sed 's/^v//' || echo '0.0.1-dev')
gh workflow run release.yml -f version="$version"
