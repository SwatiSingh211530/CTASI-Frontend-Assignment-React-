$path = "c:\Users\swati\Music\OneDrive\Desktop\Frontend_Ecommerce\Frontend"
Set-Location $path

# Remove untracked files
Write-Host "Removing untracked files..."
git clean -fd

# Remove node_modules and dist from git if tracked
Write-Host "Removing build artifacts from git..."
git rm --cached -r dist 2>$null
git rm --cached -r node_modules 2>$null

# Commit the cleanup
Write-Host "Creating clean commit..."
git add -A
git commit -m "Clean up - remove build artifacts and node_modules from git"

# Push to GitHub
Write-Host "Pushing to GitHub..."
git push -f origin main

Write-Host "Done! Repository is now clean."
Write-Host "Verify at: git log --oneline -5"
