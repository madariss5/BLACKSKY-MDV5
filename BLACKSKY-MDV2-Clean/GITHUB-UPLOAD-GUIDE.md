# BLACKSKY-MDV2 GitHub Upload Guide

This guide will help you upload the BLACKSKY-MDV2 WhatsApp bot to your GitHub repository at `https://github.com/madariss5/BLACKSKY-MDV2`.

## Prerequisites

1. A GitHub account
2. Git installed on your computer or access to the GitHub web interface
3. GitHub Personal Access Token (classic) with repo permissions

## Method 1: Manual Upload (Recommended)

Since the bot contains many files and the repository size might be large, a manual upload is recommended.

### Step 1: Download the Clean Archive
Download the `BLACKSKY-MDV2-Clean.tar.gz` file from this Replit.

### Step 2: Extract the Archive
Extract the contents of the archive to a folder on your computer.

### Step 3: Create a New Repository (if not already created)
1. Go to GitHub and log in to your account
2. Click on the "+" icon in the top right corner and select "New repository"
3. Name your repository "BLACKSKY-MDV2"
4. Choose public or private visibility as per your preference
5. Do not initialize with README, .gitignore, or license
6. Click "Create repository"

### Step 4: Upload Files via GitHub Web Interface
1. Navigate to your new repository
2. Click on the "uploading an existing file" link
3. Drag and drop the extracted files or use the file chooser
4. Add a commit message like "Initial commit"
5. Click "Commit changes"

Repeat this process as needed for additional files or folders.

### Step 5: Add Your GIFs (Optional)
Later, you can manually add your GIF files to the `gifs` folder as needed.

## Method 2: Using Git Command Line

If you prefer using Git, follow these steps:

### Step 1: Clone the Repository
```bash
git clone https://github.com/madariss5/BLACKSKY-MDV2.git
cd BLACKSKY-MDV2
```

### Step 2: Extract the Archive Contents
Extract the `BLACKSKY-MDV2-Clean.tar.gz` to this directory.

### Step 3: Add, Commit, and Push
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

Note: For large repositories, you might need to use Git LFS (Large File Storage) or increase the Git buffer size:
```bash
git config --global http.postBuffer 524288000
```

## Token-Based Authentication

GitHub no longer accepts password authentication for Git operations. Use a Personal Access Token instead:

1. Go to GitHub → Settings → Developer Settings → Personal Access Tokens → Tokens (classic)
2. Generate a new token with "repo" permissions
3. Use this token instead of your password when prompted during Git operations

## Final Notes

- The `.gitignore` file is configured to exclude certain files like GIFs and sensitive configuration
- Remember to create a proper `config.js` file based on the provided `config.example.js` template
- After uploading, verify that all necessary files are present and no sensitive data is exposed
- Add your GIF files manually to the appropriate directories after the initial upload