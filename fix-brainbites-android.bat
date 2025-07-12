@echo off
echo ====================================
echo BrainBites Android Build Fix Script
echo ====================================
echo.

:: Store the root directory
set ROOT_DIR=%cd%

:: Check if we're in the BrainBites directory
if not exist "package.json" (
    echo ERROR: Please run this script from the BrainBites root directory
    echo Current directory: %cd%
    pause
    exit /b 1
)

echo Step 1: Cleaning all caches and build artifacts...
echo ------------------------------------------------

:: Clean npm/yarn cache
echo Cleaning npm cache...
call npm cache clean --force 2>nul

:: Remove node_modules
echo Removing node_modules...
if exist "node_modules" (
    rmdir /s /q "node_modules" 2>nul
)

:: Remove package-lock.json or yarn.lock
if exist "package-lock.json" (
    del /f /q "package-lock.json" 2>nul
)
if exist "yarn.lock" (
    del /f /q "yarn.lock" 2>nul
)

:: Clean React Native cache
echo Cleaning React Native cache...
if exist "%LOCALAPPDATA%\Temp\metro-*" (
    rmdir /s /q "%LOCALAPPDATA%\Temp\metro-*" 2>nul
)
if exist "%LOCALAPPDATA%\Temp\haste-map-*" (
    rmdir /s /q "%LOCALAPPDATA%\Temp\haste-map-*" 2>nul
)

:: Clean Android specific folders
echo Cleaning Android build folders...
if exist "android\.gradle" (
    rmdir /s /q "android\.gradle" 2>nul
)
if exist "android\app\build" (
    rmdir /s /q "android\app\build" 2>nul
)
if exist "android\build" (
    rmdir /s /q "android\build" 2>nul
)

:: Remove .gradle folder from user home
echo Cleaning global Gradle cache...
if exist "%USERPROFILE%\.gradle\caches" (
    rmdir /s /q "%USERPROFILE%\.gradle\caches" 2>nul
)

echo.
echo Step 2: Reinstalling dependencies...
echo ------------------------------------

:: Install dependencies
echo Installing npm dependencies...
call npm install

:: Check if installation was successful
if errorlevel 1 (
    echo ERROR: npm install failed
    pause
    exit /b 1
)

echo.
echo Step 3: Fixing Android configuration...
echo ---------------------------------------

:: Check React Native version
echo Detecting React Native version...
for /f "tokens=2 delims=:" %%a in ('findstr /c:"react-native" package.json ^| findstr /c:"\"react-native\""') do (
    set RN_VERSION_LINE=%%a
)

:: Extract version number (remove quotes and commas)
set RN_VERSION=%RN_VERSION_LINE:~2,-2%
set RN_VERSION=%RN_VERSION: =%
echo React Native version detected: %RN_VERSION%

:: Create a backup of settings.gradle
if exist "android\settings.gradle" (
    copy "android\settings.gradle" "android\settings.gradle.backup" >nul
)

:: Fix settings.gradle
echo Fixing android/settings.gradle...
(
echo rootProject.name = 'BrainBites'
echo apply from: file^("../node_modules/@react-native-community/cli-platform-android/native_modules.gradle"^); applyNativeModulesSettingsGradle^(settings^)
echo include ':app'
) > "android\settings.gradle"

:: For React Native 0.71 and above, we don't need includeBuild
:: For older versions, we might need it
echo.

:: Create a backup of android/build.gradle
if exist "android\build.gradle" (
    copy "android\build.gradle" "android\build.gradle.backup" >nul
)

:: Check if react-native-gradle-plugin exists
if not exist "node_modules\@react-native\gradle-plugin" (
    if not exist "node_modules\react-native-gradle-plugin" (
        echo.
        echo WARNING: react-native-gradle-plugin not found in node_modules
        echo Attempting to install React Native dependencies...
        cd "%ROOT_DIR%"
        call npx react-native@%RN_VERSION% init TempProject --version %RN_VERSION% --skip-install
        if exist "TempProject\android" (
            xcopy /s /q "TempProject\android\*" "android\" /Y >nul
            rmdir /s /q "TempProject" 2>nul
        )
    )
)

echo.
echo Step 4: Running Android Gradle tasks...
echo --------------------------------------

cd "%ROOT_DIR%\android"

:: Try to run gradlew clean
echo Running gradlew clean...
call gradlew.bat clean

if errorlevel 1 (
    echo.
    echo Gradle clean failed. Attempting to fix gradle wrapper...
    
    :: Fix gradle wrapper
    cd "%ROOT_DIR%"
    if exist "node_modules\react-native\template\android\gradle\wrapper" (
        xcopy /s /q "node_modules\react-native\template\android\gradle\wrapper\*" "android\gradle\wrapper\" /Y >nul
    )
    if exist "node_modules\react-native\template\android\gradlew.bat" (
        copy "node_modules\react-native\template\android\gradlew.bat" "android\gradlew.bat" /Y >nul
    )
    if exist "node_modules\react-native\template\android\gradlew" (
        copy "node_modules\react-native\template\android\gradlew" "android\gradlew" /Y >nul
    )
    
    cd "%ROOT_DIR%\android"
    echo Retrying gradlew clean...
    call gradlew.bat clean
)

echo.
echo Step 5: Final setup...
echo ----------------------

cd "%ROOT_DIR%"

:: Pod install for iOS (if on Mac - this will fail on Windows but that's ok)
if exist "ios" (
    echo Note: iOS pod install skipped (Windows environment)
)

:: Create local.properties if it doesn't exist
if not exist "android\local.properties" (
    echo Creating android/local.properties...
    echo sdk.dir=%ANDROID_HOME%> "android\local.properties"
    echo sdk.dir=%ANDROID_SDK_ROOT%>> "android\local.properties"
)

echo.
echo ====================================
echo Fix process completed!
echo ====================================
echo.
echo Next steps:
echo 1. Try running: cd android ^&^& gradlew clean
echo 2. If successful, run: gradlew assembleDebug
echo 3. Or from root directory: npx react-native run-android
echo.
echo If you still see errors:
echo - Check that ANDROID_HOME environment variable is set
echo - Ensure Android SDK is properly installed
echo - Try running: npx react-native doctor
echo.
echo Backup files created:
echo - android/settings.gradle.backup
echo - android/build.gradle.backup
echo.
pause