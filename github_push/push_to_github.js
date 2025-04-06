// Script to push to GitHub using the GitHub API
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// GitHub repository information
const owner = 'madariss5';
const repo = 'BLACKSKY-MDV5';
const token = process.env.GITHUB_TOKEN;

if (!token) {
  console.error('GITHUB_TOKEN not found in environment variables');
  process.exit(1);
}

// Set up git with token for authentication
try {
  // Configure Git to use the token for authentication
  execSync(`git config --global url."https://${token}:x-oauth-basic@github.com/".insteadOf "https://github.com/"`);
  
  // Add remote origin if it doesn't exist
  try {
    execSync('git remote get-url origin');
    console.log('Remote origin already exists, updating it...');
    execSync(`git remote set-url origin https://github.com/${owner}/${repo}.git`);
  } catch (error) {
    console.log('Adding remote origin...');
    execSync(`git remote add origin https://github.com/${owner}/${repo}.git`);
  }
  
  // Push to GitHub
  console.log('Pushing to GitHub...');
  execSync('git push -u origin main --force');
  
  console.log('Successfully pushed to GitHub!');
} catch (error) {
  console.error('Error during GitHub push:', error.message);
  process.exit(1);
}