#!/bin/bash
# Find the latest version tag and append -dev
version=$(git describe --tags --abbrev=0 2>/dev/null | sed 's/^v//')
if [ -z "$version" ]; then
    version="0.0.1"
fi
gh workflow run release.yml -f version="${version}-dev"
