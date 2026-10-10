# Builds the release APK (signed with the debug key - for testing) and copies it to the project root.
$ErrorActionPreference = 'Continue'
$env:JAVA_HOME = 'C:\Users\E26-03822\dev-tools\jdk\jdk-17.0.20.1+1'
$env:ANDROID_HOME = 'C:\Users\E26-03822\dev-tools\android-sdk'
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
$env:Path = "C:\Users\E26-03822\dev-tools\node-v24.21.0-win-x64;$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;" + [Environment]::GetEnvironmentVariable('Path', 'Machine')
$root = $PSScriptRoot
Set-Location (Join-Path $root 'android')
& .\gradlew.bat assembleRelease '-PreactNativeArchitectures=arm64-v8a,armeabi-v7a,x86_64' *> (Join-Path $root 'build.log')
Get-Content (Join-Path $root 'build.log') | Select-String -Pattern 'BUILD|What went wrong' -Context 0,6 | Select-Object -Last 3
$apk = Join-Path $root 'android\app\build\outputs\apk\release\app-release.apk'
if (Test-Path $apk) {
    Copy-Item $apk (Join-Path $root 'SalesSetu-v1.1.0.apk') -Force
    "APK: " + (Join-Path $root 'SalesSetu-v1.1.0.apk') + "  (" + [math]::Round((Get-Item $apk).Length / 1MB, 1) + " MB)"
} else { 'APK not produced' }
