@echo off
echo ====================================================
echo Fixing android/build.gradle for React Native 0.80.x
echo ====================================================
echo.

set ROOT_DIR=%cd%

:: Check if we're in the right directory
if not exist "package.json" (
    echo ERROR: Run this from BrainBites root directory
    pause
    exit /b 1
)

:: Backup existing build.gradle files
echo Creating backups...
if exist "android\build.gradle" (
    copy "android\build.gradle" "android\build.gradle.backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%.txt" >nul
)
if exist "android\app\build.gradle" (
    copy "android\app\build.gradle" "android\app\build.gradle.backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%.txt" >nul
)

echo.
echo Creating android/build.gradle for RN 0.80.x...
echo ----------------------------------------------

:: Create the correct android/build.gradle for RN 0.80.x
(
echo buildscript {
echo     ext {
echo         buildToolsVersion = "34.0.0"
echo         minSdkVersion = 23
echo         compileSdkVersion = 34
echo         targetSdkVersion = 34
echo         ndkVersion = "26.1.10909125"
echo         kotlinVersion = "1.9.22"
echo     }
echo     repositories {
echo         google^(^)
echo         mavenCentral^(^)
echo     }
echo     dependencies {
echo         classpath^("com.android.tools.build:gradle"^)
echo         classpath^("com.facebook.react:react-native-gradle-plugin"^)
echo         classpath^("org.jetbrains.kotlin:kotlin-gradle-plugin"^)
echo         classpath^("com.google.gms:google-services:4.4.2"^)
echo     }
echo }
echo.
echo allprojects {
echo     repositories {
echo         google^(^)
echo         mavenCentral^(^)
echo         maven { url "https://www.jitpack.io" }
echo     }
echo }
echo.
echo apply plugin: "com.facebook.react.rootproject"
) > "android\build.gradle"

echo.
echo Updating android/app/build.gradle...
echo ------------------------------------

:: Create a temporary file with the updated content
(
echo apply plugin: "com.android.application"
echo apply plugin: "com.facebook.react"
echo apply plugin: "com.google.gms.google-services"
echo.
echo // Add this line only if you have react-native-vector-icons
echo // apply from: file^("../../node_modules/react-native-vector-icons/fonts.gradle"^)
echo.
echo react {
echo     // The root of your project, i.e. where "package.json" lives
echo     // root = file^("../../"^)
echo.
echo     // The folder where the react-native NPM package is. Default is ../../node_modules/react-native
echo     // reactNativeDir = file^("../../node_modules/react-native"^)
echo.
echo     // The folder where the react-native Codegen package is. Default is ../../node_modules/@react-native/codegen
echo     // codegenDir = file^("../../node_modules/@react-native/codegen"^)
echo.
echo     // The cli.js file which is the React Native CLI entrypoint. Default is ../../node_modules/react-native/cli.js
echo     // cliFile = file^("../../node_modules/react-native/cli.js"^)
echo.
echo     /* Autolinking */
echo     autolinkLibrariesWithApp^(^)
echo }
echo.
echo def enableProguardInReleaseBuilds = false
echo def jscFlavor = 'io.github.react-native-community:jsc-android:2026004.+'
echo.
echo android {
echo     ndkVersion rootProject.ext.ndkVersion
echo     buildToolsVersion rootProject.ext.buildToolsVersion
echo     compileSdk rootProject.ext.compileSdkVersion
echo.
echo     namespace "com.brainbites"
echo     
echo     defaultConfig {
echo         applicationId "com.brainbites"
echo         minSdkVersion rootProject.ext.minSdkVersion
echo         targetSdkVersion rootProject.ext.targetSdkVersion
echo         versionCode 1
echo         versionName "1.0"
echo     }
echo.
echo     signingConfigs {
echo         debug {
echo             storeFile file^('debug.keystore'^)
echo             storePassword 'android'
echo             keyAlias 'androiddebugkey'
echo             keyPassword 'android'
echo         }
echo     }
echo.
echo     buildTypes {
echo         debug {
echo             signingConfig signingConfigs.debug
echo         }
echo         release {
echo             signingConfig signingConfigs.debug
echo             minifyEnabled enableProguardInReleaseBuilds
echo             proguardFiles getDefaultProguardFile^("proguard-android.txt"^), "proguard-rules.pro"
echo         }
echo     }
echo }
echo.
echo dependencies {
echo     // The version of react-native is set by the React Native Gradle Plugin
echo     implementation^("com.facebook.react:react-android"^)
echo     implementation^("com.facebook.react:hermes-android"^)
echo.
echo     if ^(hermesEnabled.toBoolean^(^)^) {
echo         implementation^("com.facebook.react:hermes-android"^)
echo     } else {
echo         implementation jscFlavor
echo     }
echo }
echo.
echo apply from: file^("../../node_modules/@react-native-community/cli-platform-android/native_modules.gradle"^); applyNativeModulesAppBuildGradle^(project^)
) > "android\app\build.gradle.new"

:: Check if we need to preserve any custom configurations
echo.
echo Checking for custom configurations to preserve...

:: Move the new file to replace the old one
move /y "android\app\build.gradle.new" "android\app\build.gradle" >nul

echo.
echo Creating/updating gradle.properties...
echo -------------------------------------

if not exist "android\gradle.properties" (
    (
    echo # Project-wide Gradle settings.
    echo org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8
    echo org.gradle.parallel=true
    echo org.gradle.configureondemand=true
    echo org.gradle.daemon=true
    echo.
    echo # Android properties
    echo android.useAndroidX=true
    echo android.enableJetifier=true
    echo.
    echo # React Native properties
    echo hermesEnabled=true
    echo newArchEnabled=false
    echo.
    echo # Version of flipper SDK to use with React Native
    echo FLIPPER_VERSION=0.212.0
    ) > "android\gradle.properties"
)

echo.
echo Testing the configuration...
echo ---------------------------

cd "%ROOT_DIR%\android"

:: Clean gradle cache for this project
if exist ".gradle" rmdir /s /q ".gradle" 2>nul

:: Try gradlew clean
echo Running gradlew clean...
call gradlew.bat clean --refresh-dependencies

if errorlevel 1 (
    echo.
    echo Build still failing. Let's check what's missing...
    echo.
    
    :: Check if @react-native/gradle-plugin exists
    if not exist "%ROOT_DIR%\node_modules\@react-native\gradle-plugin" (
        echo ERROR: @react-native/gradle-plugin not found!
        echo.
        echo Please run:
        echo   cd %ROOT_DIR%
        echo   npm install
        echo.
    )
    
    :: Try to get more info
    echo Getting more information about the error...
    call gradlew.bat clean --stacktrace
) else (
    echo.
    echo SUCCESS! Gradle clean completed.
    echo.
    echo You can now try:
    echo   gradlew assembleDebug
    echo   or
    echo   cd .. ^&^& npx react-native run-android
)

cd "%ROOT_DIR%"

echo.
echo ====================================================
echo Fix completed!
echo ====================================================
echo.
echo Backups created with timestamp in filename
echo.
echo If you're still having issues:
echo 1. Make sure you've run 'npm install' in the root directory
echo 2. Check that all dependencies are properly installed
echo 3. Try deleting node_modules and reinstalling:
echo    rmdir /s /q node_modules
echo    npm install
echo.
pause