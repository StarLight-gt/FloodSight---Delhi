# GitHub Setup Guide

Your repository is initialized and ready to push to GitHub. Follow these steps:

## Step 1: Create GitHub Repository

1. **Go to GitHub:**
   - Visit https://github.com
   - Sign in to your account

2. **Create a new repository:**
   - Click the "+" icon in the top right → "New repository"
   - **Repository name**: `floodguard-delhi` (or your preferred name)
   - **Description**: "AI-powered flood monitoring and early warning system for Delhi NCR"
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
   - Click "Create repository"

## Step 2: Connect Your Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these:

### Option A: If you haven't pushed anything yet (Recommended)

```bash
# Add the remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/floodguard-delhi.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

### Option B: If you want to use SSH (if you have SSH keys set up)

```bash
git remote add origin git@github.com:YOUR_USERNAME/floodguard-delhi.git
git branch -M main
git push -u origin main
```

## Step 3: Verify Upload

1. Go to your GitHub repository page
2. You should see all your files
3. The README.md should display on the repository homepage

## Troubleshooting

### Authentication Issues

If you get authentication errors, you may need to:

1. **Use Personal Access Token:**
   - Go to GitHub → Settings → Developer settings → Personal access tokens
   - Generate a new token with `repo` permissions
   - Use the token as your password when pushing

2. **Or use GitHub CLI:**
   ```bash
   # Install GitHub CLI if needed
   # Then authenticate
   gh auth login
   ```

### Branch Name Issues

If GitHub expects `main` but you're on `master`:

```bash
# Rename your branch
git branch -M main

# Push with new name
git push -u origin main
```

### Large File Warnings

If you get warnings about large files, verify `.gitignore` is working:

```bash
# Check what's being tracked
git ls-files | findstr node_modules

# If node_modules is tracked, remove it
git rm -r --cached node_modules
git commit -m "Remove node_modules from tracking"
git push
```

## Quick Command Reference

```bash
# Check remote status
git remote -v

# Push changes
git push

# Pull changes (if working from multiple machines)
git pull

# Check status
git status

# View commit history
git log --oneline
```

## Next Steps After Pushing

1. **Add repository description and topics:**
   - Go to repository Settings
   - Add topics: `flood-monitoring`, `ai-agents`, `delhi`, `react`, `typescript`

2. **Set up GitHub Pages (optional):**
   - For hosting a demo version
   - Settings → Pages → Deploy from branch

3. **Add collaborators (if needed):**
   - Settings → Collaborators → Add people

4. **Set up GitHub Actions (optional):**
   - For CI/CD pipelines
   - Automated testing on push

---

**Note**: Make sure your `.env` file is NOT committed (it should be in `.gitignore`). If you need to share environment variable templates, create a `.env.example` file.

