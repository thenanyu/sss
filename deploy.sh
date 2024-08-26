#!/bin/bash

# Configuration
TARGET_REPO="git@github.com:thenanyu/thenanyu.github.io.git"
BRANCH="master"

# Ensure the script exits on any error
set -e

# Navigate to the dist directory
cd dist

# Clean up: remove the temporary Git repository
rm -rf .git


# Initialize a new Git repository
git init

# Add all files in the dist directory
git add .

# Commit the changes
git commit -m "Deploy static site"

# Add the remote repository
git remote add origin $TARGET_REPO

# Push to the target repository, force push to overwrite existing content
git push -f origin $BRANCH

# Clean up: remove the temporary Git repository
rm -rf .git

echo "Deployment complete!"
