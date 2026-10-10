@echo off
rem Starts the Android phone emulator and opens SalesSetu (installs the APK if needed).
set SDK=C:\Users\E26-03822\dev-tools\android-sdk
start "" "%SDK%\emulator\emulator.exe" -avd SalesSetu_Phone -gpu swiftshader_indirect -no-boot-anim
echo Waiting for the emulator to start...
"%SDK%\platform-tools\adb.exe" wait-for-device
:boot
"%SDK%\platform-tools\adb.exe" shell getprop sys.boot_completed | find "1" >nul || (timeout /t 3 >nul & goto boot)
rem Default GPS location: Tiruppur (longitude latitude)
"%SDK%\platform-tools\adb.exe" emu geo fix 77.3411 11.1085
"%SDK%\platform-tools\adb.exe" install -r "C:\DMApp\SalesSetu-v1.1.1.apk"
"%SDK%\platform-tools\adb.exe" shell monkey -p com.ramraj.salessetu -c android.intent.category.LAUNCHER 1 >nul
echo SalesSetu is open on the emulator. Login: SE-1001 / demo123
