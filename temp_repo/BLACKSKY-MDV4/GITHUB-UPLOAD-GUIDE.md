# GitHub Upload Guide for BLACKSKY-MD

Due to the large size of this repository (over 3000 files including many large binary assets), uploading to GitHub directly from Replit is challenging. This guide provides steps to complete the upload from your local machine.

## Step 1: Download the Repository from Replit

1. From your Replit dashboard, select this project
2. Click on the three dots menu (⋮) in the top-right corner
3. Select "Download as ZIP"
4. Save the ZIP file to your local machine and extract it

## Step 2: Prepare the Repository for GitHub

1. Open a terminal/command prompt on your local machine
2. Navigate to the extracted folder:
   ```
   cd path/to/extracted/folder
   ```

3. Initialize a new Git repository (if not already initialized):
   ```
   git init
   ```

4. Make sure your `.gitignore` file includes the following entries to exclude sensitive files:
   ```
   # Environment variables
   .env
   
   # Session files
   sessions/
   *.session.json
   creds.json
   
   # Database files
   database.json
   
   # Config file with sensitive information
   config.js
   
   # Large media files
   attached_assets/*.gif
   attached_assets/*.mp3
   attached_assets/*.mp4
   gifs/*.gif
   src/*.mp3
   src/*.mp4
   ```

5. Ensure you have a `config.example.js` file (already included) that users can use as a template

## Step 3: Push to GitHub

1. Create a new repository on GitHub named "BLACKSKY-MDV2" at https://github.com/madariss5/BLACKSKY-MDV2

2. Link your local repository to GitHub:
   ```
   git remote add origin https://github.com/madariss5/BLACKSKY-MDV2.git
   ```

3. Stage your files:
   ```
   git add .
   ```

4. Commit the changes:
   ```
   git commit -m "Initial commit of BLACKSKY-MD WhatsApp Bot"
   ```

5. Push to GitHub:
   ```
   git push -u origin main
   ```

## Step 4: Verify Your Repository

1. Visit https://github.com/madariss5/BLACKSKY-MDV2 to confirm your files were uploaded correctly
2. Make sure sensitive information (API keys, personal phone numbers, etc.) is not exposed
3. Verify the README.md file points to the correct repository URLs

## Notes on Large Files

If you're still having trouble pushing due to large files, consider using Git LFS (Large File Storage):

1. Install Git LFS: https://git-lfs.github.com/
2. Initialize Git LFS:
   ```
   git lfs install
   ```
3. Track large files:
   ```
   git lfs track "*.gif" "*.mp3" "*.mp4"
   ```
4. Add, commit, and push as normal

## Need Additional Help?

- GitHub has a size limit of 100MB per file and recommends repositories under 5GB
- For larger repositories, consider using GitHub releases for asset storage
- You can also host media files separately (e.g., on a CDN) and reference them in your code