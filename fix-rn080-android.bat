@echo off
echo =====================================
echo React Native 0.80.x Android Fix Script
echo =====================================
echo.

:: Store the root directory
set ROOT_DIR=%cd%

:: Check if we're in the BrainBites directory
if not exist "package.json" (
    echo ERROR: Please run this script from the BrainBites root directory
    pause
    exit /b 1
)

echo Detected React Native 0.80.x
echo.

:: First, let's check Android SDK
echo Step 1: Checking Android SDK setup...
echo -------------------------------------

:: Try to find Android SDK
set ANDROID_FOUND=0

:: Check common locations
if exist "%LOCALAPPDATA%\Android\Sdk" (
    set ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
    set ANDROID_FOUND=1
    echo Found Android SDK at: %LOCALAPPDATA%\Android\Sdk
) else if exist "C:\Android\Sdk" (
    set ANDROID_HOME=C:\Android\Sdk
    set ANDROID_FOUND=1
    echo Found Android SDK at: C:\Android\Sdk
) else if exist "%PROGRAMFILES%\Android\android-sdk" (
    set ANDROID_HOME=%PROGRAMFILES%\Android\android-sdk
    set ANDROID_FOUND=1
    echo Found Android SDK at: %PROGRAMFILES%\Android\android-sdk
)

if %ANDROID_FOUND%==0 (
    echo.
    echo WARNING: Android SDK not found in common locations!
    echo Please enter your Android SDK path:
    set /p ANDROID_HOME="Android SDK Path: "
)

echo.
echo Using Android SDK: %ANDROID_HOME%
echo.

:: Clean caches
echo Step 2: Cleaning caches...
echo --------------------------

if exist "android\.gradle" rmdir /s /q "android\.gradle" 2>nul
if exist "android\app\build" rmdir /s /q "android\app\build" 2>nul
if exist "android\build" rmdir /s /q "android\build" 2>nul

echo.
echo Step 3: Creating proper settings.gradle for RN 0.80.x...
echo -------------------------------------------------------

:: For React Native 0.80.x, the settings.gradle is different
echo Creating new settings.gradle...
(
echo pluginManagement {
echo     includeBuild^("../node_modules/@react-native/gradle-plugin"^)
echo     repositories {
echo         google^(^)
echo         mavenCentral^(^)
echo         gradlePluginPortal^(^)
echo     }
echo }
echo.
echo plugins {
echo     id^("com.facebook.react.settings"^)
echo }
echo.
echo extensions.configure^(com.facebook.react.ReactSettingsExtension^) { ex -^>
echo     if ^(System.getenv^("REACT_NATIVE_ARCHITECTURES"^) != null^) {
echo         ex.architectures.set^(System.getenv^("REACT_NATIVE_ARCHITECTURES"^).split^(","^)^)
echo     }
echo }
echo.
echo rootProject.name = 'BrainBites'
echo include ':app'
) > "android\settings.gradle"

echo.
echo Step 4: Creating/updating local.properties...
echo --------------------------------------------

:: Create local.properties with proper SDK path
(
echo ## This file must *NOT* be checked into Version Control Systems,
echo # as it contains information specific to your local configuration.
echo #
echo # Location of the SDK. This is only used by Gradle.
echo sdk.dir=%ANDROID_HOME:\=\\%
) > "android\local.properties"

echo Created android/local.properties with SDK path

echo.
echo Step 5: Checking gradle wrapper...
echo ----------------------------------

:: Check if gradle wrapper exists
if not exist "android\gradle\wrapper\gradle-wrapper.properties" (
    echo Gradle wrapper missing. Creating default wrapper properties...
    if not exist "android\gradle\wrapper" mkdir "android\gradle\wrapper"
    
    (
    echo distributionBase=GRADLE_USER_HOME
    echo distributionPath=wrapper/dists
    echo distributionUrl=https\://services.gradle.org/distributions/gradle-8.10.2-all.zip
    echo zipStoreBase=GRADLE_USER_HOME
    echo zipStorePath=wrapper/dists
    echo distributionSha256Sum=2ab88d6de2c23e6adae7363ae6e29cbdd2a709e992929b48b6530fd0c7133bd6
    ) > "android\gradle\wrapper\gradle-wrapper.properties"
)

echo.
echo Step 6: Setting up environment variables...
echo ------------------------------------------

:: Set environment variables for current session
set ANDROID_SDK_ROOT=%ANDROID_HOME%
set PATH=%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools;%ANDROID_HOME%\tools\bin;%PATH%

echo Environment variables set for current session.
echo.
echo To make these permanent, run:
echo setx ANDROID_HOME "%ANDROID_HOME%"
echo setx ANDROID_SDK_ROOT "%ANDROID_HOME%"
echo.

echo Step 7: Testing gradle...
echo ------------------------

cd "%ROOT_DIR%\android"

:: First, let's make sure gradlew is executable
if exist "gradlew.bat" (
    echo Running gradle wrapper...
    call gradlew.bat --version
    
    echo.
    echo Attempting gradle clean...
    call gradlew.bat clean --warning-mode all
    
    if errorlevel 1 (
        echo.
        echo Gradle clean failed. Checking for common issues...
        echo.
        echo Please check:
        echo 1. Java is installed (java -version)
        echo 2. You have Java 17 or newer for React Native 0.80.x
        echo.
    ) else (
        echo.
        echo SUCCESS! Gradle clean completed.
        echo.
    )
) else (
    echo ERROR: gradlew.bat not found!
    echo Please ensure you have the complete Android project structure.
)

cd "%ROOT_DIR%"

echo.
echo =====================================
echo Fix process completed!
echo =====================================
echo.
echo What we did:
echo - Set up Android SDK path: %ANDROID_HOME%
echo - Created proper settings.gradle for React Native 0.80.x
echo - Created local.properties with SDK location
echo - Set up gradle wrapper if missing
echo.
echo Next steps:
echo 1. If gradle clean worked, try: cd android ^&^& gradlew assembleDebug
echo 2. Or from root: npx react-native run-android
echo.
echo If you're still having issues:
echo - Make sure Java 17+ is installed: java -version
echo - Run: npx react-native doctor
echo - Check that all required Android SDK components are installed
echo.
pause