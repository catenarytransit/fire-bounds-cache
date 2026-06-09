#!/bin/bash

# A script to compress Git history by squashing commits older than a
# specified number of recent commits into a single base commit.
# THIS VERSION IS MODIFIED FOR NON-INTERACTIVE USE (e.g., in CI/CD pipelines).
# IT DOES NOT CREATE A BACKUP.

# --- Configuration ---
# Exit immediately if a command exits with a non-zero status.
set -e

# --- Script Parameters ---
# The number of recent commits to keep. Defaults to 10 if not provided.
COMMITS_TO_KEEP=${1:-10}
# Regular expression to ensure the input is a positive integer.
RE_NUM='^[1-9][0-9]*$'

# --- Pre-flight Checks ---

# 1. Ensure the input is a valid positive number.
if ! [[ $COMMITS_TO_KEEP =~ $RE_NUM ]]; then
    echo "Error: Invalid input. Please provide a positive integer for the number of commits to keep."
    echo "Usage: ./git-compress.sh [number_of_commits_to_keep]"
    exit 1
fi

# 2. Check if this is a Git repository.
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    echo "Error: This is not a Git repository. Aborting."
    exit 1
fi

# 3. Check for uncommitted changes.
if ! git diff-index --quiet HEAD --; then
    echo "Error: You have uncommitted changes. Please commit or stash them before running this script."
    exit 1
fi

# --- Informational Warning for Automated Environments ---
echo "⚠️  WARNING: Automatically proceeding with a permanent, destructive history rewrite."
echo "This script will squash all commits older than the last $COMMITS_TO_KEEP commits on the current branch."
echo "NO BACKUP WILL BE CREATED."

# --- Main Logic ---

# 1. Get current branch information.
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "Operating on branch: '$CURRENT_BRANCH'"

# 2. Define commit boundaries.
SQUASH_BOUNDARY_COMMIT="HEAD~$COMMITS_TO_KEEP"
# Check if the boundary commit exists
if ! git rev-parse --verify "$SQUASH_BOUNDARY_COMMIT" > /dev/null 2>&1; then
    echo "Error: Not enough commits in history to preserve the last $COMMITS_TO_KEEP commits."
    echo "The repository has fewer than $(($COMMITS_TO_KEEP + 1)) commits."
    exit 1
fi

echo "Compressing history before commit $(git rev-parse --short $SQUASH_BOUNDARY_COMMIT)..."

# 3. Create the temporary squashed base.
TEMP_SQUASH_BRANCH="temp-squash-$(date +%s)"
echo "Creating temporary branch '$TEMP_SQUASH_BRANCH'..."
# In a detached HEAD state, checkout won't complain about the current branch.
git checkout -b "$TEMP_SQUASH_BRANCH" "$SQUASH_BOUNDARY_COMMIT"

# Find the very first commit of the repository to reset to.
ROOT_COMMIT=$(git rev-list --max-parents=0 HEAD)
echo "Resetting to root commit '$ROOT_COMMIT' to create squashed base..."
git reset --soft "$ROOT_COMMIT"

# Create the single, squashed commit.
# For GitHub Actions, ensure user.name and user.email are configured before this script runs.
# e.g.:
# git config --global user.name "github-actions[bot]"
# git config --global user.email "github-actions[bot]@users.noreply.github.com"
COMMIT_MESSAGE="chore: Compress project history before $(date +%Y-%m-%d)"
echo "Creating squashed commit with message: '$COMMIT_MESSAGE'..."
git commit -m "$COMMIT_MESSAGE"

# 4. Rebase the recent commits onto the new base.
echo "Rebasing the latest $COMMITS_TO_KEEP commits onto the new base..."
git checkout "$CURRENT_BRANCH"
git rebase --onto "$TEMP_SQUASH_BRANCH" "$SQUASH_BOUNDARY_COMMIT" "$CURRENT_BRANCH"

# 5. Clean up the temporary branch.
echo "Cleaning up temporary branch..."
git branch -D "$TEMP_SQUASH_BRANCH"

# --- Completion ---
echo
echo "✅ History compression complete on branch '$CURRENT_BRANCH'."
echo
echo "--- Next Steps ---"
echo "1. The script has completed. The next step in your workflow can now run."
echo "2. A force-push will be required to update the remote:"
echo "   git push --force origin $CURRENT_BRANCH"
