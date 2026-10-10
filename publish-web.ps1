# Builds the SalesSetu web app and publishes it to GitHub Pages (branch gh-pages).
# URL: https://shan-crush-247.github.io/Sales-Settu-Mobile-App/
$ErrorActionPreference = 'Continue'
$env:Path = "C:\Users\E26-03822\dev-tools\node-v24.21.0-win-x64;" + $env:Path
$root = $PSScriptRoot
Set-Location $root
if (Test-Path dist) { Remove-Item dist -Recurse -Force }
npx expo export --platform web *> web-export.log
node scripts\postweb.js
$pub = Join-Path $env:TEMP 'salessetu-gh-pages'
if (Test-Path $pub) { Remove-Item $pub -Recurse -Force }
New-Item -ItemType Directory $pub | Out-Null
Copy-Item (Join-Path $root 'dist\*') $pub -Recurse -Force
Copy-Item (Join-Path $root 'dist\.nojekyll') $pub -Force
Set-Location $pub
git init -q -b gh-pages
git config user.name 'shan-crush-247'
git config user.email 'shan-crush-247@users.noreply.github.com'
git add -A
git commit -q -m "Publish SalesSetu web app"
git push -f https://github.com/shan-crush-247/Sales-Settu-Mobile-App.git gh-pages 2>&1 | Select-Object -Last 2
Set-Location $root
'Published: https://shan-crush-247.github.io/Sales-Settu-Mobile-App/'
