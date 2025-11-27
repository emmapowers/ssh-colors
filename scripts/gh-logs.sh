#!/bin/bash
run_id=$(gh run list --workflow=release.yml --limit=1 --json databaseId --jq '.[0].databaseId')
gh run view "$run_id" --log
