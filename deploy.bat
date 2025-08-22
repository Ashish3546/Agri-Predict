@echo off
echo Deploying AgriPredict to GitHub and Vercel...

echo.
echo Adding all changes to Git...
git add .

echo.
set /p commit_message="Enter commit message (or press Enter for default): "
if "%commit_message%"=="" set commit_message="Update AgriPredict application"

echo.
echo Committing changes...
git commit -m "%commit_message%"

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo Deployment complete!
echo Your changes have been pushed to: https://github.com/Ashish3546/Agri-Predict.git
echo Vercel will automatically deploy from the main branch.

pause